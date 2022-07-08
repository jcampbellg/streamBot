import dotenv from 'dotenv';
dotenv.config();
import { Client, Intents, MessageActionRow, MessageButton } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders';
import { joinVoiceChannel, createAudioResource, StreamType, createAudioPlayer } from '@discordjs/voice';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import obsClient from './obsClient.js';
import twitchApi from './twitchApi.js';
import { events } from './constants.js';
import gtts from 'node-gtts';
import tmiClient from './tmiClient.js';

const commands = [
  new SlashCommandBuilder()
    .setName('empezar')
    .setDescription('Conectarse a OBS y Twitch'),
  new SlashCommandBuilder()
    .setName('terminar')
    .setDescription('desconectarse de Twitch chat'),
  new SlashCommandBuilder()
    .setName('escena')
    .setDescription('Cambiar la escena')
    .addStringOption(option =>
      option.setName('escena').setDescription('Escena a cambiar').setRequired(true).addChoices(
        {value: 'Live', name: 'En Vivo'},
        {value: 'End', name: 'Finalizar'},
      )
    ),
  new SlashCommandBuilder()
    .setName('stream-deck')
    .setDescription('Mostrar los botones del stream deck'),
  new SlashCommandBuilder()
    .setName('cámara')
    .setDescription('Cambiar la posición de la cámara')
    .addStringOption(option =>
      option.setName('posición').setDescription('Nueva posición').setRequired(true).addChoices(
        {value: 'Face Cam TL Big', name: 'Arriba Izquierda'},
        {value: 'Face Cam DL Small', name: 'Abajo Izquierda'},
        {value: 'Face Cam Chat', name: 'Camara de Chat'},
      )
    ),
  new SlashCommandBuilder()
    .setName('activar-voz')
    .setDescription('TTS en discord')
].map(command => command.toJSON());

const commandsEven = [
  new SlashCommandBuilder()
    .setName('activar-voz')
    .setDescription('TTS en discord')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, process.env.DISCORD_JUAN_SERVER), { body: commands })
  .then(() =>console.log('Successfully registered application commands.'))
  .catch(console.error);

rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, process.env.DISCORD_EVEN_SERVER), { body: commandsEven })
  .then(() =>console.log('Successfully registered application commands.'))
  .catch(console.error);

const discordClient = new Client({intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
]});

discordClient.once('ready', () => {
	console.log('Discord is ready!');
});

let player;
let voiceConnection;

const streamDeck = (interaction, active) => {
  const scenesRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('scenes')
      .setLabel('Escenas:')
      .setStyle('SECONDARY')
      .setDisabled(true),
    new MessageButton()
      .setCustomId('Live')
      .setLabel('En Vivo')
      .setStyle(active === 'Live' ? 'SUCCESS' : 'PRIMARY'),
    new MessageButton()
      .setCustomId('End')
      .setLabel('Finalizar')
      .setStyle(active === 'End' ? 'SUCCESS' : 'PRIMARY'),
  );
  const camaraRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('camaras')
      .setLabel('Camara:')
      .setStyle('SECONDARY')
      .setDisabled(true),
    new MessageButton()
      .setCustomId('Face Cam TL Big')
      .setLabel('Arriba Izquierda')
      .setStyle(active === 'Face Cam TL Big' ? 'SUCCESS' : 'PRIMARY'),
    new MessageButton()
      .setCustomId('Face Cam DL Small')
      .setLabel('Abajo Izquierda')
      .setStyle(active === 'Face Cam DL Small' ? 'SUCCESS' : 'PRIMARY'),
    new MessageButton()
      .setCustomId('Face Cam Chat')
      .setLabel('Camara de Chat')
      .setStyle(active === 'Face Cam Chat' ? 'SUCCESS' : 'PRIMARY'),
  );
  const endRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('finish')
      .setLabel('Terminar Stream')
      .setStyle('DANGER')
  );
  interaction.reply({content: 'Stream Deck:', components: [scenesRow, camaraRow, endRow]});
}

discordClient.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
	const { commandName, channel, options, member, guildId, guild } = interaction;
  const botMember = await interaction.guild.members.fetch(process.env.DISCORD_APP_ID);
  // empezar
  if (commandName === 'empezar') {
    obsClient.connect({address: process.env.OBS_URL}).then((data) => {
      tmiClient.connect();
      interaction.reply(':white_check_mark: `Conectando a OBS`');
      channel.send(':clock3: `Autorizando App...`').then((message) => {
        twitchApi.authorize({
          method: 'POST',
          url: '/token',
          data: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_SECRET,
            grant_type: 'client_credentials',
          }
        }).then(({data}) => {
          twitchApi.eventSub.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
          message.edit(':white_check_mark: `Autorizando App`');
          channel.send(':clock3: `Subscribiendo los eventos`').then((message) => {
            twitchApi.eventSub.get().then(({data}) => {
              const ids = data.total > 0 ? data.data.map(item => item.id) : [];
              Promise.all(ids.map(id => {
                return twitchApi.eventSub({
                  method: 'DELETE',
                  url: `?id=${id}`
                });
              })).then(() => {
                Promise.all(events.map(({type, condition}) => {
                  return twitchApi.eventSub({
                    method: 'POST',
                    data: {
                      'type': type,
                      'version': '1',
                      'condition': condition,
                      'transport':{
                        'method': 'webhook',
                        'callback': 'https://jcampbellg.me/eventsub/callback',
                        'secret': process.env.TWITCH_CLIENT_ID
                      }
                    }
                  });
                })).then(() => {
                  message.edit(':white_check_mark: `Subscribiendo los eventos`');
                }).catch(err => {
                  console.log(err);
                  message.edit(':x: `Error subscribiendo los eventos` ```'+JSON.stringify(err, undefined, 2)+'```');
                });
              }).catch(err => {
                message.edit(':x: `Error eliminando los eventos` ```'+JSON.stringify(err, undefined, 2)+'```');
              });
            }).catch(err => {
              message.edit(':x: `Error obteniendo los eventos` ```'+JSON.stringify(err, undefined, 2)+'```');
            });
          });
        }).catch((err) => {
          message.edit(':x: `Error al autorizar app` ```'+JSON.stringify(err, undefined, 2)+'```');
        })
      });
    }).catch((err) => {
      interaction.reply(':x: `Error conectando a OBS:` ```'+JSON.stringify(err, undefined, 2)+'```');
    });
  }
  // terminar
  if (commandName === 'terminar') {
    tmiClient.disconnect().catch(console.error);
    interaction.reply(':white_check_mark: `Desconectado de Twitch`');
    if (voiceConnection) {
      voiceConnection.disconnect();
    }
  }
  // escena
  if (commandName === 'escena') {
    const sceneName = options.getString('escena');
    obsClient.send('SetCurrentScene', {'scene-name': sceneName }).catch(err => console.log(err));;

    if (sceneName === 'Live') {
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Sounds', filterName: 'Desktop', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Sounds', filterName: 'MIC', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Face Cam Chat', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Chat Show', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSceneItemRender', {'scene-name': 'Live', source: 'Game Source', render: false}).catch(err => { console.log(err); });
      tmiClient.say('#jcampbellg', '¡Hola Chat!');
    }
    interaction.reply(':white_check_mark: OBS en la escena `'+sceneName+'`');
  }
  // stream-deck
  if (commandName === 'stream-deck') {
    streamDeck(interaction);
  }
  // cámara
  if (commandName === 'cámara') {
    const position = options.getString('posición');
    obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: position, filterEnabled: true}).catch(err => console.log(err));

    if (position === 'Face Cam Chat') {
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Chat Show', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSceneItemRender', {'scene-name': 'Live', source: 'Game Source', render: false}).catch(err => { console.log(err); });
    } else {
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Chat Hide', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSceneItemRender', {'scene-name': 'Live', source: 'Game Source', render: true}).catch(err => { console.log(err); });
    }
    interaction.reply(':white_check_mark: Cámara se movia a `'+position+'`');
  }
  // activar voz
  if (commandName === 'activar-voz') {
    if (!member.voice.channelId) {
      interaction.reply('Ocupa un canal de voz para activar la voz');
      return;
    }
  
    if (botMember.voice.channelId) {
      interaction.reply('El robot ya está en un canal de voz');
      return;
    }

    player = createAudioPlayer();
    voiceConnection = joinVoiceChannel({
      channelId: member.voice.channelId,
      guildId: guildId,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false
    });

    interaction.reply(':white_check_mark: `Activando voz`');
  }
});

discordClient.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
  const { customId } = interaction;

  if (customId === 'finish') {
    tmiClient.disconnect().catch(console.error);
    interaction.reply(':white_check_mark: `Desconectado de Twitch`');
    if (voiceConnection) {
      voiceConnection.disconnect();
    }
  } else {
    if (['Live', 'End'].includes(customId)) {
      obsClient.send('SetCurrentScene', {'scene-name': customId }).catch(err => console.log(err));
    }

    if (customId === 'Live') {
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Sounds', filterName: 'Desktop', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Sounds', filterName: 'MIC', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Face Cam Chat', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Chat Show', filterEnabled: true}).catch(err => console.log(err));
      obsClient.send('SetSceneItemRender', {'scene-name': 'Live', source: 'Game Source', render: false}).catch(err => { console.log(err); });
      tmiClient.say('#jcampbellg', '¡Hola Chat!');
    }
    
    if (['Face Cam TL Big', 'Face Cam DL Small', 'Face Cam Chat'].includes(customId)) {
      obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: customId, filterEnabled: true}).catch(err => console.log(err));

      if (customId === 'Face Cam Chat') {
        obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Chat Show', filterEnabled: true}).catch(err => console.log(err));
        obsClient.send('SetSceneItemRender', {'scene-name': 'Live', source: 'Game Source', render: false}).catch(err => { console.log(err); });
      } else {
        obsClient.send('SetSourceFilterVisibility', { sourceName: 'Live', filterName: 'Chat Hide', filterEnabled: true}).catch(err => console.log(err));
        obsClient.send('SetSceneItemRender', {'scene-name': 'Live', source: 'Game Source', render: true}).catch(err => { console.log(err); });
      }
    }

    streamDeck(interaction, customId);
  }
  
});

export const playAudio = (text) => {
  gtts('es').save(`./call_jcampbellg.wav`, text, (err) => {
    if (err) {
      console.log(err);
    }
    const resource = createAudioResource(`./call_jcampbellg.wav`, {
      inputType: StreamType.Arbitrary
    });

    player.play(resource);
    voiceConnection.subscribe(player);
  });
};

export default discordClient;