import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import https from 'https';
import discordClient from './discordClient.js';
import eventsub from './routes/eventsub.js';

const PORT = process.env.PORT || 80;

// Certificate
const privateKey = fs.readFileSync(process.env.PRIVKEY_FILE, 'utf8');
const certificate = fs.readFileSync(process.env.CERT_FILE, 'utf8');
const ca = fs.readFileSync(process.env.CHAIN_FILE, 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

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

app.get('/.well-known/acme-challenge/wLh1R-NgGZXRVjM6erfijyq08pIStq9dhZE0CafsMD8', (req, res, next) => {
  res.send("wLh1R-NgGZXRVjM6erfijyq08pIStq9dhZE0CafsMD8.BxeFoaCABavJSUILsmYKMH_SFQccHneTkogWk9jnfHA");
});

app.use('/eventsub', eventsub);

// SERVER
app.set('port', PORT);
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.on('listening', () => {
  console.log('HTTP Listening on ' + PORT);
});

httpsServer.on('listening', () => {
  console.log('HTTPS Listening on ' + 443);
});

httpServer.listen(PORT);
httpsServer.listen(443);
discordClient.login(process.env.DISCORD_BOT_TOKEN);