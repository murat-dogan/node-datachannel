/// <reference lib="dom" />

export class RTCPeerConnectionIceEvent extends Event {
    readonly candidate: RTCIceCandidate | null;
}

export class RTCDataChannelEvent extends Event {
    readonly channel: RTCDataChannel | null;
}

export class MessageEvent extends Event {
    readonly data: any;
    readonly origin: string;
    readonly lastEventId: string;
    readonly source: 'Window' | 'MessagePort' | 'ServiceWorker' | null;
    readonly ports: MessagePort[];
}
