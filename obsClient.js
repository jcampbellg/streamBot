import OBSWebSocket from 'obs-websocket-js';
const obsClient = new OBSWebSocket();

obsClient.on('ConnectionOpened', () => {
  obsClient.send('SetVolume', { source: 'MIC', volume: 0}).catch(err => console.log(err));
  obsClient.send('SetVolume', { source: 'Desktop', volume: 0}).catch(err => console.log(err));
  obsClient.send('SetCurrentScene', {'scene-name': 'Starting' }).catch(err => { console.log(err); });
  obsClient.send('SetSceneItemRender', {'scene-name': 'Stream Points', source: 'Random Gif', render: false}).catch(err => { console.log(err); });
});

export default obsClient;