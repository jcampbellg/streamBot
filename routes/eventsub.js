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
        channel.send('```'+`${subscription.type}\n`+JSON.stringify(event, undefined, 2)+'```');
      });

      if (subscription.type === eventsType.redemption) {
        switch (event.reward.title) {
          case 'SIIUUU':
            obsClient.send('RestartMedia', { sourceName: 'SIUUU' }).catch(err => console.log(err));
            break;
          case 'Una Dedicatoria':
            obsClient.send('RestartMedia', { sourceName: 'Alert Gif' }).catch(err => console.log(err));
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
              const availableGifs = data.data.filter(gif => gif && gif.embed_url);
              const i = Math.floor(Math.random() * availableGifs.length);
              const gifUrl = availableGifs[i].embed_url;
            
              obsClient.sendCallback('CreateSource', {sceneName: 'Stream Points', sourceName: 'Random Gif', sourceKind: 'browser_source', sourceSettings: {url: gifUrl, width: 500, height: 400}}, (err, res) => {
                if (err) {
                  console.log(err);
                } else {
                  obsClient.send('RestartMedia', { sourceName: 'Alert Gif' }).catch(err => console.log(err));
                  obsClient.send('SetSceneItemProperties', {'scene-name': 'Stream Points', item: 'Random Gif', position: {x: 710, y: 0}}).catch(err => { console.log(err); });
                  setTimeout(() => {
                    obsClient.send('DeleteSceneItem', {scene: 'Stream Points', item: {name: 'Random Gif'}}).catch(err => { console.log(err); });
                  }, 10000);
                }
              });
            }).catch(err => { console.error(err); });
            break;
          default:
            break;
        }
      }

      let followText = null;

      if (subscription.type === eventsType.follow) {
        followText = `¡${event.user_name} te esta siguiendo!`;
      }
      if (subscription.type === eventsType.subscriptionGift || subscription.type === eventsType.subscribe) {
        followText = `¡${event.user_name} se ha suscrito a tu canal!`;
      }
      if (subscription.type === eventsType.subscriptionMessage) {
        followText = `¡${event.user_name} se ha suscrito a tu canal!\n${event.message.text}`;
      }
      if (subscription.type === eventsType.cheer) {
        followText = `¡${event.user_name} te ha dado ${event.bits} bits!\n${event.message}`;
      }
      if (subscription.type === eventsType.raid) {
        followText = `¡${event.from_broadcaster_user_name} ha hecho un raid junto con ${event.viewers} personas!`;
      }

      if (followText) {
        obsClient.send('RestartMedia', { sourceName: 'Alert Video' }).catch(err => console.log(err));
        obsClient.send('SetSceneItemRender', {'scene-name': 'Alerts', source: 'Follow Text', render: true}).catch(err => { console.log(err); });
        obsClient.send('SetTextGDIPlusProperties', {source: 'Follow Text', text: followText}).catch(err => console.log(err));

        setTimeout(() => {
          obsClient.send('SetSceneItemRender', {'scene-name': 'Alerts', source: 'Follow Text', render: false}).catch(err => { console.log(err); });
        }, 4000);
      }
      res.sendStatus(204);
      break;
    default:
      res.sendStatus(204);
  }
});

export default router;