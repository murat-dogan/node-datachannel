/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

/* eslint-disable @typescript-eslint/no-var-requires */
const nodeDataChannel = require('node-datachannel');
const WebSocket = require('ws');
const { contextBridge } = require('electron');

nodeDataChannel.initLogger('Debug');
nodeDataChannel.preload();

// My ID
let myId = getRandomString(4);
let remoteId = '';
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('my-id').innerHTML = myId;
});

// PeerConnection Map
const pcMap = {};
const dcMap = {};

// Signaling Server
const WS_URL = process.env.WS_URL || 'ws://localhost:8000';
const ws = new WebSocket(WS_URL + '/' + myId, {
    perMessageDeflate: false,
});

ws.on('open', () => {
    console.log('WebSocket connected, signaling ready');
});

ws.on('error', (err) => {
    console.log('WebSocket Error: ', err);
});

ws.on('message', (msgStr) => {
    msg = JSON.parse(msgStr);
    switch (msg.type) {
        case 'offer':
            document.getElementById('connect').disabled = true;
            document.getElementById('remote-id').disabled = true;
            document.getElementById('remote-id').value = msg.id;

            remoteId = msg.id;
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

function connect() {
    remoteId = document.getElementById('remote-id').value;
    if (remoteId && remoteId.length > 2) {
        // disable connect button
        document.getElementById('connect').disabled = true;
        document.getElementById('remote-id').disabled = true;

        createPeerConnection(remoteId);
        dcMap[remoteId] = pcMap[remoteId].createDataChannel('chat');
        dcMap[remoteId].onOpen(() => {
            document.getElementById('messages').value += 'DataChannel opened: ' + remoteId + '\n';
        });

        dcMap[remoteId].onMessage((msg) => {
            console.log('Message from ' + remoteId + ' received:', msg);
            // Add message to textarea
            document.getElementById('messages').value += remoteId + '> ' + msg + '\n';
        });
    }
}

function sendMessage() {
    if (remoteId && remoteId.length > 2) {
        let msg = document.getElementById('new-message').value;
        if (msg && msg.length > 0) {
            document.getElementById('new-message').value = '';
            document.getElementById('messages').value += 'me> ' + msg + '\n';
            dcMap[remoteId].sendMessage(msg);
        }
    }
}

let intervalref = null;
function sendRandomMessage() {
    let enabled = document.getElementById('sendRandom').checked;

    if (intervalref) clearInterval(intervalref);
    if (!enabled) return;

    let interval = document.getElementById('randomInterval').value;
    intervalref = setInterval(() => {
        if (remoteId && remoteId.length > 2) {
            let msg = getRandomString(10);
            document.getElementById('messages').value += 'me> ' + msg + '\n';
            dcMap[remoteId].sendMessage(msg);
        }
    }, interval);
}

function createPeerConnection(peerId) {
    // Create PeerConnection
    let peerConnection = new nodeDataChannel.PeerConnection(myId, { iceServers: ['stun:stun.l.google.com:19302'] });
    peerConnection.onStateChange((state) => {
        console.log('State: ', state);
        // set state value
        document.getElementById('state').innerHTML = state;
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
        console.log('DataChannel from ' + peerId + ' received with label "', dc.getLabel() + '"');
        document.getElementById('messages').value += 'DataChannel opened: ' + peerId + '\n';
        dcMap[peerId] = dc;
        dc.onMessage((msg) => {
            console.log('Message from ' + peerId + ' received:', msg);
            // Add message to textarea
            document.getElementById('messages').value += peerId + '> ' + msg + '\n';
        });
    });

    pcMap[peerId] = peerConnection;
}

function getRandomString(length) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

contextBridge.exposeInMainWorld('myAPI', {
    connect,
    sendMessage,
    sendRandomMessage,
});
