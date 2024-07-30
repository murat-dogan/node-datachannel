const nodeDataChannel = require('node-datachannel');
const { RTCPeerConnection } = require('node-datachannel/polyfill');

nodeDataChannel.initLogger('Debug');

// Create a new PeerConnection object
const peer1 = new nodeDataChannel.PeerConnection('Peer1', {
  iceServers: ['stun:stun.l.google.com:19302'],
});
peer1.close();

// Polyfill PeerConnection
const peer2 = new RTCPeerConnection({
  peerIdentity: 'Peer2',
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
});
peer2.close();

// Cleanup the node-datachannel library
nodeDataChannel.cleanup();
