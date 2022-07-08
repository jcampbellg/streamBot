import dotenv from 'dotenv';
import { exec } from 'child_process';
dotenv.config();
import express from 'express';
import twitchApi from '../twitchApi.js';
const router = express.Router();

router.get('/', (req, res, next) => { 
  const code = req.query.code;
  twitchApi.authorize({
    method: 'POST',
    url: '/token',
    data: {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://jcampbellg.me/token'
    }
  }).then(({data}) => {
    res.send(data);
    exec(`export TWITCH_BOT_PASSWORD=${data.access_token}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      }
      exec('pm2 restart streamBot --update-env', (err, stdout, stderr) => {
        if (err) {
          console.log(err);
        }
      })
    });
  })
});

export default router;