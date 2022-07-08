import dotenv from 'dotenv';
dotenv.config();
import tmi from 'tmi.js';
import { cmdActions } from './constants.js';
import obsClient from './obsClient.js';

const regexCommand = new RegExp(/^!([a-zA-Z0-9]+)\W+([a-zA-Z0-9+()-]+)(?:\W+)?(.*)?/)
const regexJustCommand = new RegExp(/^!([a-zA-Z0-9]+)?/);

const tmiClient = new tmi.Client({
	identity: {
		username: 'jcampbellg',
		password: process.env.TWITCH_BOT_PASSWORD
	},
	channels: [ 'jcampbellg' ]
});

let squad = [];
let flashes = 0;

tmiClient.on('message', (channel, tags, message, self) => {
  if(!message.startsWith('!')) return;

  const [raw, command, action, argument] = message.match(regexCommand) || message.match(regexJustCommand);

  if (command.toLowerCase() === 'squad') {
    if (cmdActions.add.includes(action && action.toLowerCase())) {
      squad = [...squad, ...argument.split(',').map(s => s.trim())];
    }
    if (cmdActions.subtract.includes(action && action.toLowerCase())) {
      squad = squad.filter(member => member.toLowerCase() !== argument && argument.toLowerCase());
    }
    if (cmdActions.clear.includes(action && action.toLowerCase())) {
      squad = [];
    }

    const squadMsg = squad.length > 1 ? `${[...squad].slice(0, squad.length-1).join(', ')} y ${[...squad].pop()}` : `${squad.join(', ')}`;
    tmiClient.say(channel, squad.length === 0 ? 'No hay ningun miembro en el squad.' : `El squad es: ${squadMsg}`);
  }

  if (command.toLowerCase() === 'specs') {
    tmiClient.say(channel, 'GPU: NVIDIA GeForce RTX 3070ti');
    tmiClient.say(channel, 'CPU: AMD Ryzen 5 5600X');
    tmiClient.say(channel, 'Memory: 16 GB RAM');
    tmiClient.say(channel, 'Current resolution: 2560 x 1440, 270Hz');
  }

  if (['flash', 'flashes', 'blind', 'ciego', 'pajaro'].includes(command.toLowerCase())) {
    if (cmdActions.add.includes(action && action.toLowerCase())) {
      flashes++;
    } else if (cmdActions.subtract.includes(action && action.toLowerCase())) {
      flashes--;
    } else if (cmdActions.clear.includes(action && action.toLowerCase())) {
      flashes = 0;
    }
    flashes++;

    obsClient.send('RestartMedia', { sourceName: 'Alert Gif' }).catch(err => console.log(err));
    obsClient.send('SetSceneItemRender', {'scene-name': 'Chat CMD', source: 'Flashes', render: true}).catch(err => { console.log(err); });
    setTimeout(() => {
      obsClient.send('SetSceneItemRender', {'scene-name': 'Chat CMD', source: 'Flashes', render: false}).catch(err => { console.log(err); });
    }, 4000);
    tmiClient.say(channel, `Flahses de hoy: ${flashes} flashes`);
  }

});

export default tmiClient;