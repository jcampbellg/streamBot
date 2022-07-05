import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();

// Declare some events to listen for.
obs.on('ConnectionOpened', () => {
  obs.send('SetVolume', { source: 'MIC', volume: 0}).catch(err => console.log(err));
  obs.send('SetVolume', { source: 'Desktop', volume: 0}).catch(err => console.log(err));
  obs.send('SetCurrentScene', {'scene-name': 'Starting' }).catch(err => { console.log(err); });
});

export default obs;