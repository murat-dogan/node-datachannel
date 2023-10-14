import polyfill from '../polyfill/index.js';
import * as nodeDataChannel from '../lib/index.js';

nodeDataChannel.initLogger('Info');

let dc1 = null;
let dc2 = null;

let peer1 = new polyfill.RTCPeerConnection({
    peerIdentity: 'peer1',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
});

// Set Callbacks
peer1.onconnectionstatechange = () => {
    console.log('Peer1 State:', peer1.connectionState);
};
peer1.oniceconnectionstatechange = () => {
    console.log('Peer1 IceState:', peer1.iceConnectionState);
};
peer1.onicegatheringstatechange = () => {
    console.log('Peer1 GatheringState:', peer1.iceGatheringState);
};
peer1.onicecandidate = (e) => {
    console.log('Peer1 Candidate:', e.candidate.candidate);
    peer2.addIceCandidate(e.candidate);
};

let peer2 = new polyfill.RTCPeerConnection({
    peerIdentity: 'peer2',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
});

// Set Callbacks
peer2.onconnectionstatechange = () => {
    console.log('Peer2 State:', peer2.connectionState);
};
peer2.oniceconnectionstatechange = () => {
    console.log('Peer2 IceState:', peer2.iceConnectionState);
};
peer2.onicegatheringstatechange = () => {
    console.log('Peer2 GatheringState:', peer2.iceGatheringState);
};
peer2.onicecandidate = (e) => {
    console.log('Peer2 Candidate:', e.candidate.candidate);
    peer1.addIceCandidate(e.candidate);
};
peer2.ondatachannel = (dce) => {
    console.log(11111, JSON.stringify(peer1.localDescription));
    console.log(22222, JSON.stringify(peer2.localDescription));
    console.log('Peer2 Got DataChannel: ', dce.channel.label);
    dc2 = dce.channel;
    dc2.onmessage = (msg) => {
        console.log('Peer2 Received Msg:', msg.data.toString());
    };
    dc2.send('Hello From Peer2');
    dc2.onclose = () => {
        console.log('dc2 closed');
    };

    //
    let sctp = peer2.sctp;
    console.log('sctp:', sctp.maxChannels, sctp.maxMessageSize, sctp.state);
    sctp.onstatechange = () => {
        console.log('sctp state:', sctp.state);
    };

    let ice = sctp.transport.iceTransport;
    console.log('local', JSON.stringify(ice.getLocalCandidates()));
    console.log('remote', JSON.stringify(ice.getRemoteCandidates()));
    console.log('selected', JSON.stringify(ice.getSelectedCandidatePair()));
    console.log('*******************', ice.role);

    ice.onstatechange = () => {
        console.log('ice state:', ice.state);
    };
};

dc1 = peer1.createDataChannel('test');
dc1.onopen = () => {
    dc1.send('Hello from Peer1');
};
dc1.onmessage = (msg) => {
    console.log('Peer1 Received Msg:', msg.data.toString());
};
dc1.onclose = () => {
    console.log('dc1 closed');
};

peer1
    .createOffer({})
    .then((desc) => {
        // console.log(122222, desc);
        peer2.setRemoteDescription(desc);
    })
    .catch((err) => console.error(err));

peer2
    .createAnswer({})
    .then((answerDesc) => {
        peer1.setRemoteDescription(answerDesc);
    })
    .catch((err) => console.error("Couldn't create answer", err));

setTimeout(() => {
    peer1.close();
    peer2.close();
    nodeDataChannel.cleanup();
}, 5 * 1000);
