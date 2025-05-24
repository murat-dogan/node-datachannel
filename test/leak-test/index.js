// https://github.com/murat-dogan/node-datachannel/issues/349
// from https://github.com/achingbrain

import why from 'why-is-node-running';
import { RTCPeerConnection } from 'node-datachannel/polyfill';
import { initLogger } from 'node-datachannel';

initLogger('Error');

process.stdout.write('.');

// how many channels to open
const numChannels = 20;

// how much data to send on each one
const send = 1024 * 1024;

// the chunk size to send - needs to divide `send` with no remainder
const chunkSize = 1024;

const peer1 = new RTCPeerConnection();
const peer2 = new RTCPeerConnection();

// track channel status
const channelStatus = {};

// echo any data back to the sender
peer2.addEventListener('datachannel', (evt) => {
  const channel = evt.channel;
  const label = channel.label;

  channelStatus[`incoming-${label}`] = 'open';

  channel.addEventListener('message', (evt) => {
    channel.send(evt.data);
  });
  channel.addEventListener('close', (evt) => {
    console.info(`channel closed: ${label}`);
    delete channelStatus[`incoming-${label}`];
  });
});

const channels = [];

// create channels
for (let i = 0; i < numChannels; i++) {
  channels.push(peer1.createDataChannel(`c-${i}`));
}

// ensure peers are connected
await connectPeers(peer1, peer2);

// send data over each channel in parallel
await Promise.all(
  channels.map(async (channel) => {
    channel.binaryType = 'arraybuffer';
    const label = channel.label;

    await isOpen(channel);

    channelStatus[`outgoing-${label}`] = 'open';

    // send data and wait for it to be echoed back
    return new Promise((resolve, reject) => {
      let received = 0;
      let sent = 0;

      channel.addEventListener('message', (evt) => {
        received += evt.data.byteLength;

        // all data has been echoed back to us
        if (received === send) {
          // this makes no difference
          //   channel.close();
          resolve();
        }
      });

      channel.addEventListener('close', (evt) => {
        delete channelStatus[`outgoing-${label}`];
      });

      while (sent !== send) {
        channel.send(new Uint8Array(chunkSize));
        sent += chunkSize;
      }
    });
  }),
);

// close connections
peer1.close();
peer2.close();

// print open handles after 5s - unref so this timeout doesn't keep the event loop running
setTimeout(() => {
  console.info('\n-- channels');
  console.info(JSON.stringify(channelStatus, null, 2));
  console.info('');

  why();
}, 5_000).unref();

export async function connectPeers(peer1, peer2) {
  const peer1Offer = await peer1.createOffer();
  await peer2.setRemoteDescription(peer1Offer);

  const peer2Answer = await peer2.createAnswer();
  await peer1.setRemoteDescription(peer2Answer);

  peer1.addEventListener('icecandidate', (e) => {
    peer2.addIceCandidate(e.candidate);
  });

  peer2.addEventListener('icecandidate', (e) => {
    peer1.addIceCandidate(e.candidate);
  });

  await Promise.all([isConnected(peer1), isConnected(peer2)]);
}

async function isConnected(peer) {
  return new Promise((resolve, reject) => {
    peer.addEventListener('connectionstatechange', () => {
      if (peer.connectionState === 'connected') {
        resolve();
      }

      if (peer.connectionState === 'failed') {
        reject(new Error('Connection failed'));
      }
    });
  });
}

async function isOpen(dc) {
  if (dc.readyState === 'open') {
    return;
  }

  return new Promise((resolve, reject) => {
    dc.addEventListener('open', () => {
      resolve();
    });
    dc.addEventListener('error', () => {
      reject(new Error('Channel error'));
    });
  });
}
