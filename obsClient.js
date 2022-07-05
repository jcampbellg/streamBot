import OBSWebSocket from 'obs-websocket-js';
const obsClient = new OBSWebSocket();

// Declare some events to listen for.
obsClient.on('ConnectionOpened', () => {
  obsClient.send('SetVolume', { source: 'MIC', volume: 0}).catch(err => console.log(err));
  obsClient.send('SetVolume', { source: 'Desktop', volume: 0}).catch(err => console.log(err));
  obsClient.send('SetCurrentScene', {'scene-name': 'Starting' }).catch(err => { console.log(err); });
});

export default obsClient;