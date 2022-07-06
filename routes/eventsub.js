import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { eventsType } from '../constants.js';
import discordClient, { playAudio } from '../discordClient.js';
import obsClient from '../obsClient.js';
import twitchApi from '../twitchApi.js';
const router = express.Router();

router.post('/callback', (req, res, next) => { 
  switch (req.headers['twitch-eventsub-message-type']) {
    case 'webhook_callback_verification':
      res.status(200).send(req.body.challenge);
      break;
    case 'notification':
      const { event, subscription} = req.body;
      discordClient.channels.fetch(process.env.DISCORD_NOTIFICATION_CHANNEL).then(channel => {
        channel.send('```'+JSON.stringify(event, undefined, 2)+'```');
      });

      if (subscription.type === eventsType.redemption) {
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
          case 'Dame un Call (TTS)':
            playAudio(`${event.user_name} dice: ${event.user_input}`);
            break;
          case 'Random Gif':
            twitchApi.giphy.get('/search', {
              params: {
                api_key: 'tWzC5FFP4o7ZuMs7VCYTx5z9y0JM45MI',
                q: event.user_input,
                limit: 25,
                lang: 'es'
              }
            }).then(({data}) => {
              const i = Math.floor(Math.random() * 24);
              const gifUrl = data.data[i].images;
              console.log(gifUrl);

              obsClient.send('SetBrowserSourceProperties', {source: 'Random Gif', url: gifUrl}).catch(err => { console.log(err); });
              obsClient.send('SetSceneItemRender', {'scene-name': 'Stream Points', source: 'Random Gif', render: true}).catch(err => { console.log(err); });
    
              setTimeout(() => {
                obsClient.send('SetSceneItemRender', {'scene-name': 'Stream Points', source: 'Random Gif', render: false}).catch(err => { console.log(err); });
              }, 10000);
            }).catch(err => { console.log(err); });
            break;
          default:
            break;
        }
      }

      res.sendStatus(204);
      break;
    default:
      res.sendStatus(204);
  }
});

export default router;