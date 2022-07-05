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
          obsClient.send('RestartMedia', { sourceName: 'SIUUU' }).catch(err => console.log(err));
          break;
        case 'Una Dedicatoria':
          obsClient.send('SetTextGDIPlusProperties', {source: 'Message', text: event.user_input}).catch(err => console.log(err));
          obsClient.send('SetTextGDIPlusProperties', {source: 'User', text: event.user_name}).catch(err => console.log(err));
          obsClient.send('SetSceneItemRender', {'scene-name': 'Stream Points', source: 'New Message', render: true}).catch(err => { console.log(err); });

          setTimeout(() => {
            obsClient.send('SetSceneItemRender', {'scene-name': 'Stream Points', source: 'New Message', render: false}).catch(err => { console.log(err); });
          }, 10000);
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