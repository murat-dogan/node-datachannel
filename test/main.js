const nodeDataChannel = require('../lib/index');

console.log('Main Exports: ', nodeDataChannel);

nodeDataChannel.initLogger("Debug");

let dc1 = null;
let dc2 = null;

let peer1 = new nodeDataChannel.PeerConnection(
    "Peer1",
    { iceServers: ["stun.l.google.com:19302"] },
    (event, payload) => {
        switch (event) {
            case "state":
                console.log("Peer1 State:", payload);
                break;
            case "gathering-state":
                console.log("Peer1 GatheringState:", payload);
                break;
            case "sdp":
                console.log("Peer1 SDP:", payload);
                peer2.setRemoteDescription(payload);
                break;
            case "candidate":
                console.log("Peer1 Candidate:", payload);
                peer2.addRemoteCandidate(payload);
                break;

            default:
                break;
        }
    }
);

let peer2 = new nodeDataChannel.PeerConnection(
    "Peer2",
    { iceServers: ["stun.l.google.com:19302"] },
    (event, payload) => {
        switch (event) {
            case "state":
                console.log("Peer2 State:", payload);
                break;
            case "gathering-state":
                console.log("Peer2 GatheringState:", payload);
                break;
            case "sdp":
                console.log("Peer2 SDP:", payload);
                peer1.setRemoteDescription(payload);
                break;
            case "candidate":
                console.log("Peer2 Candidate:", payload);
                peer1.addRemoteCandidate(payload);
                break;
            case "data-channel":
                console.log("Peer2 Got DataChannel: ", payload.getLabel());
                dc2 = payload;
                dc2.setCallback((event, payload) => {
                    console.log("Peer2 DataChannel Event:", event, " Payload:", payload);
                });
                dc2.sendMessage("Hello From Peer2");

            default:
                break;
        }
    }
);

dc1 = peer1.createDataChannel("test");
dc1.setCallback((event, payload) => {
    console.log("Peer1 DataChannel Event:", event, " Payload:", payload);
    if (event === "open")
        dc1.sendMessage("Hello From Peer1");
});

setTimeout(() => {
    dc1.close();
    dc2.close();
    peer1.close();
    peer2.close();
}, 10 * 1000);