# node-datachannel - libdatachannel node bindings 

![Build CI](https://github.com/murat-dogan/node-datachannel/workflows/Build%20CI/badge.svg)

> "libdatachannel is a standalone implementation of WebRTC Data Channels and WebSockets in C++17 with C bindings for POSIX platforms (including Linux and Apple macOS) and Microsoft Windows. "

NodeJS bindings for [libdatachannel](https://github.com/paullouisageneau/libdatachannel) library. 

Please check [libdatachannel](https://github.com/paullouisageneau/libdatachannel) for Compatibility & WebRTC details.

## Examples
```js
const nodeDataChannel = require('../lib/index');

console.log('Main Exports: ', nodeDataChannel);

nodeDataChannel.initLogger("Debug");

let dc1 = null;
let dc2 = null;

let peer1 = new nodeDataChannel.PeerConnection("Peer1", { iceServers: ["stun.l.google.com:19302"] });

// Set Callbacks
peer1.onStateChange((state) => {
    console.log("Peer1 State:", state);
});
peer1.onGatheringStateChange((state) => {
    console.log("Peer1 GatheringState:", state);
});
peer1.onLocalDescription((sdp) => {
    console.log("Peer1 SDP:", sdp);
    peer2.setRemoteDescription(sdp);
});
peer1.onLocalCandidate((candidate) => {
    console.log("Peer1 Candidate:", candidate);
    peer2.addRemoteCandidate(candidate);
});

let peer2 = new nodeDataChannel.PeerConnection("Peer2", { iceServers: ["stun.l.google.com:19302"] });

// Set Callbacks
peer2.onStateChange((state) => {
    console.log("Peer2 State:", state);
});
peer2.onGatheringStateChange((state) => {
    console.log("Peer2 GatheringState:", state);
});
peer2.onLocalDescription((sdp) => {
    console.log("Peer2 SDP:", sdp);
    peer1.setRemoteDescription(sdp);
});
peer2.onLocalCandidate((candidate) => {
    console.log("Peer2 Candidate:", candidate);
    peer1.addRemoteCandidate(candidate);
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
}, 10 * 1000);
```
## Install

Prebuilt binaries are available for Windows, Linux & Mac (Node Version >= 10)

```sh
> npm install node-datachannel --save
```

## Build

### Requirements
* cmake >= V3.1
* [libdatachannel dependencies](https://github.com/paullouisageneau/libdatachannel/blob/master/README.md#dependencies)

### Building from source

```sh
> git clone https://github.com/murat-dogan/node-datachannel.git
> cd node-datachannel
> npm i
```

Build with libnice support
```sh
> npm run install-nice
```

Other Options
```sh
> npm run install -- -DUSE_GNUTLS=1   # Use GNU TLS instead of OpenSSL (Default False)
> npm run install -- -DUSE_SRTP=1   # Enable SRTP for media support ( Default False)
```

### Test
```sh
> npm run test                  # Unit tests
> node test/connectivity.js     # Connectivity
```

### Examples

Check `examples` folder
