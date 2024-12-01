import { RTCPeerConnection, RTCDataChannel } from '../src/polyfill/index';
import nodeDataChannel from '../src/lib/index';

nodeDataChannel.initLogger('Info');

let dc1: RTCDataChannel = null;
let dc2: RTCDataChannel = null;

const peer1 = new RTCPeerConnection({
    peerIdentity: 'peer1',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
});

// Set Callbacks
peer1.onconnectionstatechange = (): void => {
    console.log('Peer1 State:', peer1.connectionState);
};
peer1.oniceconnectionstatechange = (): void => {
    console.log('Peer1 IceState:', peer1.iceConnectionState);
};
peer1.onicegatheringstatechange = (): void => {
    console.log('Peer1 GatheringState:', peer1.iceGatheringState);
};
peer1.onicecandidate = (e): void => {
    console.log('Peer1 Candidate:', e.candidate.candidate);
    peer2.addIceCandidate(e.candidate);
};

const peer2 = new RTCPeerConnection({
    peerIdentity: 'peer2',
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
});

// Set Callbacks
peer2.onconnectionstatechange = (): void => {
    console.log('Peer2 State:', peer2.connectionState);
};
peer2.oniceconnectionstatechange = (): void => {
    console.log('Peer2 IceState:', peer2.iceConnectionState);
};
peer2.onicegatheringstatechange = (): void => {
    console.log('Peer2 GatheringState:', peer2.iceGatheringState);
};
peer2.onicecandidate = (e): void => {
    console.log('Peer2 Candidate:', e.candidate.candidate);
    peer1.addIceCandidate(e.candidate);
};
peer2.ondatachannel = (dce): void => {
    console.log('Peer2 Got DataChannel: ', dce.channel.label);
    dc2 = dce.channel;
    dc2.onmessage = (msg): void => {
        console.log('Peer2 Received Msg:', msg.data.toString());
    };
    dc2.send('Hello From Peer2');
    dc2.onclose = (): void => {
        console.log('dc2 closed');
    };
};

dc1 = peer1.createDataChannel('test');
dc1.onopen = (): void => {
    dc1.send('Hello from Peer1');
};
dc1.onmessage = (msg): void => {
    console.log('Peer1 Received Msg:', msg.data.toString());
};
dc1.onclose = (): void => {
    console.log('dc1 closed');
};

peer1
    .createOffer()
    .then((desc) => {
        peer2.setRemoteDescription(desc);
    })
    .catch((err) => console.error(err));

peer2
    .createAnswer()
    .then((answerDesc) => {
        peer1.setRemoteDescription(answerDesc);
    })
    .catch((err) => console.error("Couldn't create answer", err));

setTimeout(() => {
    peer1.close();
    peer2.close();
}, 5 * 1000);
