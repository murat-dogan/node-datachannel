import './event-target-polyfill.js';

export class RTCPeerConnectionIceEvent extends Event {
    #candidate;

    constructor(candidate) {
        super('icecandidate');

        this.#candidate = candidate;
    }

    get candidate() {
        return this.#candidate;
    }
}

export class RTCDataChannelEvent extends Event {
    #channel;

    constructor(channel) {
        super('datachannel');

        this.#channel = channel;
    }

    get channel() {
        return this.#channel;
    }
}

export class MessageEvent extends Event {
    #data;

    constructor(type, options = {}) {
        super('message');

        this.#data = options.data;
    }

    get data() {
        return this.#data;
    }
}
