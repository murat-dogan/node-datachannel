# node-datachannel - libdatachannel node bindings

![Build CI](https://github.com/murat-dogan/node-datachannel/workflows/Build%20CI/badge.svg)

> "libdatachannel is a standalone implementation of WebRTC Data Channels, WebRTC Media Transport, and WebSockets in C++17 with C bindings for POSIX platforms (including GNU/Linux, Android, and Apple macOS) and Microsoft Windows. It enables direct connectivity between native applications and web browsers without the pain of importing the entire WebRTC stack. "

NodeJS bindings for [libdatachannel](https://github.com/paullouisageneau/libdatachannel) library.

Please check [libdatachannel](https://github.com/paullouisageneau/libdatachannel) for Compatibility & WebRTC details.

## Examples
```js
const nodeDataChannel = require('node-datachannel');

// Log Level
nodeDataChannel.initLogger("Debug");

// SCTP Settings ( use of nodeDataChannel.setSctpSettings() )
// export interface SctpSettings {
//     recvBufferSize?: number;
//     sendBufferSize?: number;
//     maxChunksOnQueue?: number;
//     initialCongestionWindow?: number;
//     congestionControlModule?: number;
//     delayedSackTime?: number;
// }

let dc1 = null;
let dc2 = null;

// Config options
// export interface RtcConfig {
//     iceServers: string[];
//     proxyServer?: ProxyServer;
//     enableIceTcp?: boolean;
//     portRangeBegin?: number;
//     portRangeEnd?: number;
//     maxMessageSize?: number;
//     iceTransportPolicy?: TransportPolicy;
// }

// "iceServers" option is an array of stun/turn server urls
// Examples;
// STUN Server Example          : stun:stun.l.google.com:19302
// TURN Server Example          : turn:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT
// TURN Server Example (TCP)    : turn:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT?transport=tcp
// TURN Server Example (TLS)    : turns:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT

let peer1 = new nodeDataChannel.PeerConnection("Peer1", { iceServers: ["stun:stun.l.google.com:19302"] });

// Set Callbacks
peer1.onStateChange((state) => {
    console.log("Peer1 State:", state);
});
peer1.onGatheringStateChange((state) => {
    console.log("Peer1 GatheringState:", state);
});
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
peer2.onStateChange((state) => {
    console.log("Peer2 State:", state);
});
peer2.onGatheringStateChange((state) => {
    console.log("Peer2 GatheringState:", state);
});
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

// DataChannel Options
// export interface DataChannelInitConfig {
//     protocol?: string;
//     negotiated?: boolean;
//     id?: number;
//     ordered?: boolean;
//     maxPacketLifeTime?: number;
//     maxRetransmits?: number;
//
//     // Deprecated, use ordered, maxPacketLifeTime, and maxRetransmits
//     reliability?: {
//         type?: ReliabilityType;
//         unordered?: boolean;
//         rexmit?: number;
//     }
// }
dc1 = peer1.createDataChannel("test");
dc1.onOpen(() => {
    dc1.sendMessage("Hello from Peer1");
    // Binary message: Use sendMessageBinary(Buffer)
});
dc1.onMessage((msg) => {
    console.log('Peer1 Received Msg:', msg);
});

setTimeout(() => {
    dc1.close();
    dc2.close();
    peer1.close();
    peer2.close();
    dc1 = null;
    dc2 = null;
    peer1 = null;
    peer2 = null;
    nodeDataChannel.cleanup();
}, 10 * 1000);
```
## Install

Prebuilt binaries are available (Node Version >= 10);
* Windows (x86, x64)
* Linux (x64, armv7, arm64)
* Mac

```sh
> npm install node-datachannel --save
```

## Build

### Requirements
* cmake >= V3.14
* [libdatachannel dependencies](https://github.com/paullouisageneau/libdatachannel/blob/master/README.md#dependencies)

### Building from source

```sh
> git clone https://github.com/murat-dogan/node-datachannel.git
> cd node-datachannel
> npm i
```

Other Options
```sh
> npm run install -- -DUSE_GNUTLS=1  # Use GnuTLS instead of OpenSSL (Default False)
> npm run install -- -DUSE_NICE=1    # Use libnice instead of libjuice (Default False)
```

### Test
```sh
> npm run test                  # Unit tests
> node test/connectivity.js     # Connectivity
```

### More Examples

Check `examples` folder

## Thanks


Thanks to [Streamr](https://streamr.network/) for supporting this project by being a Sponsor!

