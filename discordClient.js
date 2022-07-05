import { Client, Intents } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import obsClient from './obsClient.js'
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('empezar')
    .setDescription('Conectarse a OBS')
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
  if (commandName === 'empezar') {
    obsClient.connect({address: process.env.OBS_URL}).then((data) => {
      interaction.reply(':white_check_mark: `Conectado a OBS`');
      channel.send(':clock3: `Subscribiendo eventos de Twitch...`').then((message) => {
        console.log(message)
      });
    }).catch((err) => {
      interaction.reply(':x: `Error conectando a OBS:` ```'+JSON.stringify(err, undefined, 2)+'```');
    });
  }
});

export default discordClient;