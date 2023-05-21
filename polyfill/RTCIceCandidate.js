export default class RTCIceCandidate {
    constructor(init = {}) {}

    #_address = null;

    get address() {
        return this.#_address;
    }

    #_candidate = null;

    get candidate() {
        return this.#_candidate;
    }

    #_component = null;

    get component() {
        return this.#_component;
    }

    #_foundation = null;

    get foundation() {
        return this.#_foundation;
    }

    #_port = null;

    get port() {
        return this.#_port;
    }

    #_priority = null;

    get priority() {
        return this.#_priority;
    }

    #_protocol = null;

    get protocol() {
        return this.#_protocol;
    }

    #_relatedAddress = null;

    get relatedAddress() {
        return this.#_relatedAddress;
    }

    #_relatedPort = null;

    get relatedPort() {
        return this.#_relatedPort;
    }

    #_sdpMLineIndex = null;

    get sdpMLineIndex() {
        return this.#_sdpMLineIndex;
    }

    #_sdpMid = null;

    get sdpMid() {
        return this.#_sdpMid;
    }

    #_tcpType = null;

    get tcpType() {
        return this.#_tcpType;
    }

    #_type = null;

    get type() {
        return this.#_type;
    }

    #_usernameFragment = null;

    get usernameFragment() {
        return this.#_usernameFragment;
    }

    #_ = null;

    toJSON() {
        return {
            candidate: this.candidate,
            sdpMLineIndex: this.sdpMLineIndex,
            sdpMid: this.sdpMid,
            usernameFragment: this.usernameFragment,
        };
    }
}
