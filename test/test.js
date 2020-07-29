const nodeDataChannel = require('../lib/index');

test('Module Defined', () => {
    expect(nodeDataChannel).toBeDefined();
    expect(nodeDataChannel.initLogger).toBeDefined();
    expect(nodeDataChannel.PeerConnection).toBeDefined();
    expect(typeof nodeDataChannel.PeerConnection).toBe('function');
    expect(nodeDataChannel.DataChannel).toBeDefined();
    expect(typeof nodeDataChannel.DataChannel).toBe('function');
});

test('Create PeerConnection', () => {
    let peer = new nodeDataChannel.PeerConnection("Peer1", { iceServers: ["stun:stun.l.google.com:19302"] });
    expect(peer).toBeDefined();
    expect(peer.onStateChange).toBeDefined();
    expect(peer.createDataChannel).toBeDefined();
});