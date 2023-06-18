export default class RTCIceCandidate {
    constructor(init = {}) {}

    #address = null;

    get address() {
        return this.#address;
    }

    #candidate = null;

    get candidate() {
        return this.#candidate;
    }

    #component = null;

    get component() {
        return this.#component;
    }

    #foundation = null;

    get foundation() {
        return this.#foundation;
    }

    #port = null;

    get port() {
        return this.#port;
    }

    #priority = null;

    get priority() {
        return this.#priority;
    }

    #protocol = null;

    get protocol() {
        return this.#protocol;
    }

    #relatedAddress = null;

    get relatedAddress() {
        return this.#relatedAddress;
    }

    #relatedPort = null;

    get relatedPort() {
        return this.#relatedPort;
    }

    #sdpMLineIndex = null;

    get sdpMLineIndex() {
        return this.#sdpMLineIndex;
    }

    #sdpMid = null;

    get sdpMid() {
        return this.#sdpMid;
    }

    #tcpType = null;

    get tcpType() {
        return this.#tcpType;
    }

    #type = null;

    get type() {
        return this.#type;
    }

    #usernameFragment = null;

    get usernameFragment() {
        return this.#usernameFragment;
    }

    toJSON() {
        return {
            candidate: this.candidate,
            sdpMLineIndex: this.sdpMLineIndex,
            sdpMid: this.sdpMid,
            usernameFragment: this.usernameFragment,
        };
    }
}
