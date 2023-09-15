# Easy to use WebRTC data channels and media transport

![Linux CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Linux/badge.svg) ![Windows CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Win/badge.svg) ![Mac x64 CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Mac%20x64/badge.svg) ![Mac M1 CI Build](https://github.com/murat-dogan/node-datachannel/workflows/Build%20-%20Mac%20M1/badge.svg)

-   Easy to use
-   Lightweight
    -   No need to deal with WebRTC stack!
    -   Small binary sizes
-   Type infos for Typescript

This project is NodeJS bindings for [libdatachannel](https://github.com/paullouisageneau/libdatachannel) library.

Please check [libdatachannel](https://github.com/paullouisageneau/libdatachannel) for Compatibility & WebRTC details.

## Install

```sh
npm install node-datachannel
```

## Supported Platforms

`node-datachannel` targets N-API version 8 and supports NodeJS v16 and above. It is tested on Linux, Windows and MacOS. For N-API compatibility please check [here](https://nodejs.org/api/n-api.html#n_api_n_api_version_matrix).

|          | Linux-x64 | Linux-armv7 | Linux-arm64(1) | Windows-x86 | Windows-x64 | Mac (M1 + x64) |
| -------- | :-------: | :---------: | :------------: | :---------: | :---------: | :------------: |
| Node V16 |     +     |      +      |       +        |      +      |      +      |       +        |
| Node V17 |     +     |      +      |       +        |      +      |      +      |       +        |
| Node V18 |     +     |      +      |       +        |      +      |      +      |       +        |
| Node V19 |     +     |      +      |       +        |      +      |      +      |       +        |
| Node V20 |     +     |      +      |       +        |      +      |      +      |       +        |

1. Please note that; For Linux-arm64 platform we need OpenSSL to be installed locally.

## Electron

`node-datachannel` supports Electron.

Please check [electron demo](/examples/electron-demo)

## Example Usage

```js
import nodeDataChannel from 'node-datachannel';

// Log Level
nodeDataChannel.initLogger('Debug');

let dc1 = null;
let dc2 = null;

let peer1 = new nodeDataChannel.PeerConnection('Peer1', { iceServers: ['stun:stun.l.google.com:19302'] });

// Set Callbacks
peer1.onLocalDescription((sdp, type) => {
    console.log('Peer1 SDP:', sdp, ' Type:', type);
    peer2.setRemoteDescription(sdp, type);
});
peer1.onLocalCandidate((candidate, mid) => {
    console.log('Peer1 Candidate:', candidate);
    peer2.addRemoteCandidate(candidate, mid);
});

let peer2 = new nodeDataChannel.PeerConnection('Peer2', { iceServers: ['stun:stun.l.google.com:19302'] });

// Set Callbacks
peer2.onLocalDescription((sdp, type) => {
    console.log('Peer2 SDP:', sdp, ' Type:', type);
    peer1.setRemoteDescription(sdp, type);
});
peer2.onLocalCandidate((candidate, mid) => {
    console.log('Peer2 Candidate:', candidate);
    peer1.addRemoteCandidate(candidate, mid);
});
peer2.onDataChannel((dc) => {
    console.log('Peer2 Got DataChannel: ', dc.getLabel());
    dc2 = dc;
    dc2.onMessage((msg) => {
        console.log('Peer2 Received Msg:', msg);
    });
    dc2.sendMessage('Hello From Peer2');
});

dc1 = peer1.createDataChannel('test');

dc1.onOpen(() => {
    dc1.sendMessage('Hello from Peer1');
});

dc1.onMessage((msg) => {
    console.log('Peer1 Received Msg:', msg);
});

setTimeout(() => {
    dc1.close();
    dc2.close();
    peer1.close();
    peer2.close();
    nodeDataChannel.cleanup();
}, 10 * 1000);
```

## WebRTC Polyfills

Please check [here](/polyfill)

## Test

```sh
npm run test                  # Unit tests
node test/connectivity.js     # Connectivity
```

## Build

Please check [here](/BULDING.md)

## Examples

Please check [examples](/examples/) folder

## API Docs

Please check [docs](/API.md) page

## Thanks

Thanks to [Streamr](https://streamr.network/) for supporting this project by being a Sponsor!
