import dotenv from 'dotenv';
dotenv.config();
import { Client, Intents } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import obsClient from './obsClient.js';
import twitchApi from './twitchApi.js';
import { events } from './constants.js';

const commands = [
  new SlashCommandBuilder()
    .setName('empezar')
    .setDescription('Conectarse a OBS'),
  new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_ID, process.env.DISCORD_JUAN_SERVER), { body: commands })
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

discordClient.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
	const { commandName, channel } = interaction;
  // empezar
  if (commandName === 'empezar') {
    obsClient.connect({address: process.env.OBS_URL}).then((data) => {
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
              console.log(ids);
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

  interaction.reply(commandName);
});

export default discordClient;