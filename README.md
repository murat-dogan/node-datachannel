# Easy to use WebRTC data channels and media transport

![Build CI](https://github.com/murat-dogan/node-datachannel/workflows/Build%20CI/badge.svg)

- Easy to use
- Lightweight
  - No need to deal with WebRTC stack!
  - Small binary sizes
- Type infos for Typescript

This project is NodeJS bindings for [libdatachannel](https://github.com/paullouisageneau/libdatachannel) library.

Please check [libdatachannel](https://github.com/paullouisageneau/libdatachannel) for Compatibility & WebRTC details.

## Install

```sh
npm install node-datachannel
```

## Supported Platforms

|          | Linux-x64 | Linux-armv7 | Linux-arm64(1)   | Windows-x86 | Windows-x64 | Mac (M1 + x64) |
|----------|:---------:|:-----------:|:----------------:|:-----------:|:-----------:|:--------------:|
| Node V10 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V11 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V12 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V13 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V14 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V15 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V16 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V17 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V18 |     +     |      +      |      +           |      +      |      +      |       +        |
| Node V19 |     +     |      +      |      +           |      +      |      +      |       +        |

1) Please note that; For Linux-arm64 platform we need OpenSSL to be installed locally.


## Example Usage

```js
const nodeDataChannel = require('node-datachannel');

// Log Level
nodeDataChannel.initLogger("Debug");

let dc1 = null;
let dc2 = null;

let peer1 = new nodeDataChannel.PeerConnection("Peer1", { iceServers: ["stun:stun.l.google.com:19302"] });

// Set Callbacks
peer1.onLocalDescription((sdp, type) => {
    console.log("Peer1 SDP:", sdp, " Type:", type);
    peer2.setRemoteDescription(sdp, type);
});
peer1.onLocalCandidate((candidate, mid) => {
    console.log("Peer1 Candidate:", candidate);
    peer2.addRemoteCandidate(candidate, mid);
});

let peer2 = new nodeDataChannel.PeerConnection("Peer2", { iceServers: ["stun:stun.l.google.com:19302"] });

// Set Callbacks
peer2.onLocalDescription((sdp, type) => {
    console.log("Peer2 SDP:", sdp, " Type:", type);
    peer1.setRemoteDescription(sdp, type);
});
peer2.onLocalCandidate((candidate, mid) => {
    console.log("Peer2 Candidate:", candidate);
    peer1.addRemoteCandidate(candidate, mid);
});
peer2.onDataChannel((dc) => {
    console.log("Peer2 Got DataChannel: ", dc.getLabel());
    dc2 = dc;
    dc2.onMessage((msg) => {
        console.log('Peer2 Received Msg:', msg);
    });
    dc2.sendMessage("Hello From Peer2");
});

dc1 = peer1.createDataChannel("test");

dc1.onOpen(() => {
    dc1.sendMessage("Hello from Peer1");
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

