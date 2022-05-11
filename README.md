# Easy to use WebRTC data channels and media transport

![Build CI](https://github.com/murat-dogan/node-datachannel/workflows/Build%20CI/badge.svg)

- Easy to use
- Lightweight
  - No need to deal with WebRTC stack!
  - Small binary sizes
- Has Prebuilt binaries (Linux,Windows,ARM)
- Type infos for Typescript

> "libdatachannel is a standalone implementation of WebRTC Data Channels, WebRTC Media Transport, and WebSockets in C++17 with C bindings for POSIX platforms (including GNU/Linux, Android, and Apple macOS) and Microsoft Windows. It enables direct connectivity between native applications and web browsers without the pain of importing the entire WebRTC stack. "


This project is NodeJS bindings for [libdatachannel](https://github.com/paullouisageneau/libdatachannel) library.

Please check [libdatachannel](https://github.com/paullouisageneau/libdatachannel) for Compatibility & WebRTC details.

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

> Please check examples/media folder for media usage example

## Install

Prebuilt binaries are available (Node Version >= 10);
* Windows (x86, x64)
* Linux (x64, armv7, arm64)
* Mac

```sh
> npm install node-datachannel --save
```

## API

###  PeerConnection Class

**Constructor**

let pc = new PeerConnection(peerName[,options])
- peerName `<string>` Peer name to use for logs etc..
- options `<Object>` WebRTC Config Options
```
export interface RtcConfig {
    iceServers: (string | IceServer)[];
    proxyServer?: ProxyServer;
    enableIceTcp?: boolean;
    enableIceUdpMux?: boolean;
    portRangeBegin?: number;
    portRangeEnd?: number;
    maxMessageSize?: number;
    mtu?: number;
    iceTransportPolicy?: TransportPolicy;
}

export const enum RelayType {
    TurnUdp = 'TurnUdp',
    TurnTcp = 'TurnTcp',
    TurnTls = 'TurnTls'
}

export interface IceServer {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
    relayType?: RelayType;
}

export type TransportPolicy = 'all' | 'relay';

"iceServers" option is an array of stun/turn server urls
Examples;
STUN Server Example          : stun:stun.l.google.com:19302
TURN Server Example          : turn:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT
TURN Server Example (TCP)    : turn:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT?transport=tcp
TURN Server Example (TLS)    : turns:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT

```

**close: () => void**

Close Peer Connection

**setRemoteDescription: (sdp: string, type: DescriptionType) => void**

Set Remote Description
```
export const enum DescriptionType {
    Unspec = 'Unspec',
    Offer = 'Offer',
    Answer = 'Answer'
}
```

**addRemoteCandidate: (candidate: string, mid: string) => void**

Add remote candidate info

**createDataChannel: (label: string, config?: DataChannelInitConfig) => DataChannel**

Create new data-channel
* label `<string>` Data channel name
* config `<Object>` Data channel options
```
export interface DataChannelInitConfig {
    protocol?: string;
    negotiated?: boolean;
    id?: number;
    ordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;

    // Deprecated, use ordered, maxPacketLifeTime, and maxRetransmits
    reliability?: {
        type?: ReliabilityType;
        unordered?: boolean;
        rexmit?: number;
    }
}

export const enum ReliabilityType {
    Reliable = 0, Rexmit = 1, Timed = 2
}
```
**state: () => string**

Get current state

**signalingState: () => string**

Get current signaling state

**gatheringState: () => string**

Get current gathering state

**onLocalDescription: (cb: (sdp: string, type: DescriptionType) => void) => void**

Local Description Callback
```
export const enum DescriptionType {
    Unspec = 'Unspec',
    Offer = 'Offer',
    Answer = 'Answer'
}
```

**onLocalCandidate: (cb: (candidate: string, mid: string) => void) => void**

Local Candidate Callback

**onStateChange: (cb: (state: string) => void) => void**

State Change Callback

**onSignalingStateChange: (state: (sdp: string) => void) => void**

Signaling State Change Callback

**onGatheringStateChange: (state: (sdp: string) => void) => void**

Gathering State Change Callback

**onDataChannel: (cb: (dc: DataChannel) => void) => void**

New Data Channel Callback

**bytesSent: () => number**

Get bytes sent stat

**bytesReceived: () => number**

Get bytes received stat

**rtt: () => number**

Get rtt stat

**getSelectedCandidatePair: () => { local: SelectedCandidateInfo, remote: SelectedCandidateInfo }**

Get info about selected candidate pair
```
export interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
}
```

###  DataChannel Class

> You can create a new Datachannel instance by calling `PeerConnection.createDataChannel` function.

**close: () => void**

Close data channel

**getLabel: () => string**

Get label of data-channel

**sendMessage: (msg: string) => boolean**

Send Message as string

**sendMessageBinary: (buffer: Buffer) => boolean**

Send Message as binary

**isOpen: () => boolean**

Query data-channel

**bufferedAmount: () => number**

Get current buffered amount level

**maxMessageSize: () => number**

Get max message size of the data-channel, that could be sent

**setBufferedAmountLowThreshold: (newSize: number) => void**

Set buffer level of the `onBufferedAmountLow` callback

**onOpen: (cb: () => void) => void**

Open callback

**onClosed: (cb: () => void) => void**

Closed callback

**onError: (cb: (err: string) => void) => void**

Error callback

**onBufferedAmountLow: (cb: () => void) => void**

Buffer level low callback

**onMessage: (cb: (msg: string | Buffer) => void) => void**

New Message callback

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

