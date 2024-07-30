import RTCDataChannel from './RTCDataChannel';
import RTCIceCandidate from './RTCIceCandidate';

interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}

export class RTCPeerConnectionIceEvent extends Event {
    #candidate: RTCIceCandidate;

    constructor(candidate: RTCIceCandidate) {
        super('icecandidate');

        this.#candidate = candidate;
    }

    get candidate(): RTCIceCandidate {
        return this.#candidate;
    }
}

export interface RTCDataChannelEventInit extends EventInit {
    channel: RTCDataChannel;
}

export class RTCDataChannelEvent extends Event {
    #channel: RTCDataChannel;

    constructor(type: string, eventInitDict: RTCDataChannelEventInit) {
        super(type);

        if (type && !eventInitDict.channel) throw new TypeError('channel member is required');

        this.#channel = eventInitDict?.channel;
    }

    get channel(): RTCDataChannel {
        return this.#channel;
    }
}
