import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import discordClient from '../discordClient.js';
const router = express.Router();

router.post('/callback', (req, res, next) => {
  const notification = req.body.notification;
  const event = notification.event;
  switch (req.headers['twitch-eventsub-message-type']) {
    case 'webhook_callback_verification':
      res.status(200).send(notification.challenge);
      break;
    case 'notification':
      res.json(event);
      discordClient.channels.fetch(process.env.DISCORD_NOTIFICATION_CHANNEL).then(channel => {
        channel.send('```'+JSON.stringify(event, undefined, 2)+'```');
      });
      break;
    default:
      res.sendStatus(204);
  }
});

export default router;