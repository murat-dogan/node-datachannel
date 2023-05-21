export default class RTCSessionDescription {
    constructor(init = {}) {
        // spec says these are read only, but chromium doesn't implement them that way
        this.#type = init.type || null;
        this.#sdp = init.sdp || '';
    }

    get type() {
        return this.#type;
    }

    get sdp() {
        return this.#sdp;
    }

    toJSON() {
        return {
            sdp: this.sdp,
            type: this.type,
        };
    }
}
