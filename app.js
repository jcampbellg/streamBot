import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import dotenv from 'dotenv';
import discordClient from './discordClient.js';
import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();
dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});
app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API ROUTES
app.get('/', (req, res, next) => {
  res.send("<h1>Hellow World!</h1>");
});

// SERVER
app.set('port', PORT);
const server = http.createServer(app);
server.on('listening', () => {
  console.log('Listening on ' + PORT);
});

server.listen(PORT);
discordClient.login(process.env.DISCORD_BOT_TOKEN);

obs.connect('ws://127.0.0.1:4444', undefined, {rpcVersion: 1}).then((data) => {
  console.log('connected to obs');
}).catch((err) => {
  console.error(err);
});