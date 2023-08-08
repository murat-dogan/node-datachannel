// @ts-check

export class PeerConnectionIceEvent extends Event {
    #candidate = null;
    get candidate() {
        return this.#candidate;
    }

    constructor(candidate) {
        super('icecandidate');

        this.#candidate = candidate;
    }
}

export class DataChannelEvent extends Event {
    #channel = null;
    get channel() {
        return this.#channel;
    }

    constructor(channel) {
        super('datachannel');

        this.#channel = channel;
    }
}
