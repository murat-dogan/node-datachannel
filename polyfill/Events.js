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
    #origin;
    #lastEventId;
    #source;
    #ports;

    constructor(type, options = {}) {
        super(type);

        this.#data = options.data;
        this.#origin = options.origin || '';
        this.#lastEventId = options.lastEventId || '';
        this.#source = options.source || null;
        this.#ports = options.ports || [];
    }

    get data() {
        return this.#data;
    }

    get origin() {
        return this.#origin;
    }

    get lastEventId() {
        return this.#lastEventId;
    }

    get source() {
        return this.#source;
    }

    get ports() {
        return this.#ports;
    }
}
