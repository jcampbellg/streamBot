import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import tmiClient from '../tmiClient.js';
import twitchApi from '../twitchApi.js';
import tmi from 'tmi.js';
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
    tmiClient = new tmi.Client({
      identity: {
        username: 'jcampbellg',
        password: data.access_token
      },
      channels: [ 'jcampbellg' ]
    });
    res.send(data);
  })
});

export default router;