import dotenv from 'dotenv';
dotenv.config();
import tmi from 'tmi.js';

const regexCommand = new RegExp(/^!([a-zA-Z0-9]+)\W+([a-zA-Z0-9+()-]+)(?:\W+)?(.*)?/)
const regexJustCommand = new RegExp(/^!([a-zA-Z0-9]+)?/);

const tmiClient = new tmi.Client({
	identity: {
		username: 'jcampbellg',
		password: '6gcw5y1vxp6u3madytqixyuwryvqzi'
	},
	channels: [ 'jcampbellg' ]
});

let squad = [];

tmiClient.on('message', (channel, tags, message, self) => {
  if(!message.startsWith('!')) return;

  const [raw, command, action, argument] = message.match(regexCommand) || message.match(regexJustCommand);

  if(command.toLowerCase() === 'squad') {
    if(['add', 'sumar', '+', 'a', 'añadir', 'agregar', 'anadir'].includes(action && action.toLowerCase())) {
      squad = [...squad, ...argument.split(',').map(s => s.trim())];
    }
    if(['sub', 'subtract', '-', 's', 'restar', 'quitar', 'remove', 'rm'].includes(action && action.toLowerCase())) {
      squad = squad.filter(member => member.toLowerCase() !== argument && argument.toLowerCase());
    }
    if(['clear', 'limpiar', 'c'].includes(action && action.toLowerCase())) {
      squad = [];
    }

    const squadMsg = squad.length > 1 ? `${[...squad].slice(0, squad.length-1).join(', ')} y ${[...squad].pop()}` : `${squad.join(', ')}`;
    tmiClient.say(channel, squad.length === 0 ? 'No hay ningun miembro en el squad.' : `El squad es: ${squadMsg}`);
  }

  if(command.toLowerCase() === 'specs') {
    tmiClient.say(channel, 'GPU: NVIDIA GeForce RTX 3070ti');
    tmiClient.say(channel, 'CPU: AMD Ryzen 5 5600X');
    tmiClient.say(channel, 'Memory: 16 GB RAM');
    tmiClient.say(channel, 'Current resolution: 2560 x 1440, 270Hz');
  }
});

tmiClient.on('join', (channel, username, message, self) => {
  if(self) return;

  tmiClient.say(channel, `¡${username} Bienvenido a mi stream!`);
});