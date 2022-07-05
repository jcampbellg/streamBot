import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();

// Declare some events to listen for.
obs.on('ConnectionOpened', () => {
  console.log('Connection Opened');
});

export default obs;