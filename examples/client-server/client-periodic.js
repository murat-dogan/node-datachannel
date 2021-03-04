const nodeDataChannel = require('../../lib/index');
const WebSocket = require('ws');
const readline = require("readline");

// Init Logger
nodeDataChannel.initLogger('Debug');

// PeerConnection Map
const pcMap = {};

// Local ID
const id = randomId(4);

// Message Size
const MESSAGE_SIZE = 1000;

// Read Line Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Signaling Server
const WS_URL = process.env.WS_URL || "ws://localhost:8000"
const ws = new WebSocket(WS_URL + '/' + id, {
    perMessageDeflate: false
});

console.log(`The local ID is: ${id}`);
console.log(`Waiting for signaling to be connected...`);

ws.on('open', () => {
    console.log('WebSocket connected, signaling ready');
    readUserInput();
});

ws.on('error', (err) => {
    console.log('WebSocket Error: ', err);
});

ws.on('message', (msgStr) => {
    msg = JSON.parse(msgStr);
    switch (msg.type) {
        case 'offer':
            createPeerConnection(msg.id);
            pcMap[msg.id].setRemoteDescription(msg.description, msg.type);
            break;
        case 'answer':
            pcMap[msg.id].setRemoteDescription(msg.description, msg.type);
            break;
        case 'candidate':
            pcMap[msg.id].addRemoteCandidate(msg.candidate, msg.mid);
            break;

        default:
            break;
    }
});

function readUserInput() {
    rl.question('Enter a remote ID to send an offer: ', (peerId) => {
        if (peerId && peerId.length > 2) {
            rl.close();
            console.log('Offering to ', peerId);
            createPeerConnection(peerId);

            console.log('Creating DataChannel with label "test"');
            let dc = pcMap[peerId].createDataChannel('test');

            let msgToSend = randomId(MESSAGE_SIZE);
            let bytesSent = 0;
            let bytesReceived = 0;

            dc.onOpen(() => {
                setInterval(() => {
                    dc.sendMessage(msgToSend)
                    bytesSent += msgToSend.length;;
                }, 2);
            });

            dc.onMessage((msg) => {
                bytesReceived += msg.length;
            });

            // Report
            let i = 0;
            setInterval(() => {
                console.log(`${i++}# Sent: ${formatRate(bytesSent)} KB/s  Received: ${formatRate(bytesReceived)} KB/s  SendBufferAmount: ${dc.bufferedAmount()} DataChannelOpen: ${dc.isOpen()}`);
                bytesSent = 0;
                bytesReceived = 0;
                function formatRate(bytes) {
                    return `${Math.round(bytes / 1024)}`
                }
            }, 1000);
        }
    });
}

function createPeerConnection(peerId) {
    // Create PeerConnection
    let peerConnection = new nodeDataChannel.PeerConnection('pc', { iceServers: ['stun:stun.l.google.com:19302'] });
    peerConnection.onStateChange((state) => {
        console.log('State: ', state);
    });
    peerConnection.onGatheringStateChange((state) => {
        console.log('GatheringState: ', state);
    });
    peerConnection.onLocalDescription((description, type) => {
        ws.send(JSON.stringify({ id: peerId, type, description }));
    });
    peerConnection.onLocalCandidate((candidate, mid) => {
        ws.send(JSON.stringify({ id: peerId, type: 'candidate', candidate, mid }));
    });
    peerConnection.onDataChannel((dc) => {
        rl.close();
        console.log('DataChannel from ' + peerId + ' received with label "', dc.getLabel() + '"');

        let msgToSend = randomId(MESSAGE_SIZE);
        let bytesSent = 0;
        let bytesReceived = 0;

        setInterval(() => {
            dc.sendMessage(msgToSend)
            bytesSent += msgToSend.length;;
        }, 2);


        dc.onMessage((msg) => {
            bytesReceived += msg.length;
        });

        // Report
        let i = 0;
        setInterval(() => {
            console.log(`${i++}# Sent: ${formatRate(bytesSent)} KB/s  Received: ${formatRate(bytesReceived)} KB/s  SendBufferAmount: ${dc.bufferedAmount()} DataChannelOpen: ${dc.isOpen()}`);
            bytesSent = 0;
            bytesReceived = 0;
            function formatRate(bytes) {
                return `${Math.round(bytes / 1024)}`
            }
        }, 1000);
    });

    pcMap[peerId] = peerConnection;
}

function randomId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}