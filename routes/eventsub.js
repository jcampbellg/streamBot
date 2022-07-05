import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import discordClient from '../discordClient.js';
import obsClient from '../obsClient.js';
const router = express.Router();

router.post('/callback', (req, res, next) => { 
  switch (req.headers['twitch-eventsub-message-type']) {
    case 'webhook_callback_verification':
      res.status(200).send(req.body.challenge);
      break;
    case 'notification':
      const event = req.body.event;
      discordClient.channels.fetch(process.env.DISCORD_NOTIFICATION_CHANNEL).then(channel => {
        channel.send('```'+JSON.stringify(event, undefined, 2)+'```');
      });

      switch (event.reward.title) {
        case 'SIIUUU':
          obsClient.send('RestartMedia', { source: 'SIUUU' }).catch(err => console.log(err));
          break;
        default:
          break;
      }
      res.sendStatus(204);
      break;
    default:
      res.sendStatus(204);
  }
});

export default router;