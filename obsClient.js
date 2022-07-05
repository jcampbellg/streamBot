import OBSWebSocket from 'obs-websocket-js';
const obsClient = new OBSWebSocket();

// Declare some events to listen for.
obsClient.on('ConnectionOpened', () => {
  // obsClient.send('SetVolume', { source: 'MIC', volume: 0}).catch(err => console.log(err));
  // obsClient.send('SetVolume', { source: 'Desktop', volume: 0}).catch(err => console.log(err));
  // obsClient.send('SetCurrentScene', {'scene-name': 'Starting' }).catch(err => { console.log(err); });
  obsClient.send('SetSceneItemRender', {'scene-name': 'Stream Points', source: 'New Message', render: true}).catch(err => { console.log(err); });
  obsClient.send('SetTextGDIPlusProperties', {source: 'Message', text: 'Hola mundo'}).catch(err => console.log(err));

});

obsClient.connect({address: process.env.OBS_URL});
export default obsClient;