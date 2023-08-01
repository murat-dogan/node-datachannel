// @ts-check
import DOMException from 'node-domexception';
/**
 * @class
 * @implements {RTCIceCandidate}
 */
export default class {
    /**
     * @param  {RTCIceCandidateInit} init={}
     */
    constructor(init = {}) {
        if (init.candidate == null) {
            throw new DOMException('candidate must be specified');
        }

        this.#candidate = init.candidate;
        this.#sdpMLineIndex = init.sdpMLineIndex ?? null;
        this.#sdpMid = init.sdpMid ?? null;
        this.#usernameFragment = init.usernameFragment ?? null;
    }

    #address = null;

    get address() {
        return this.#address;
    }

    #candidate;

    get candidate() {
        return this.#candidate || '';
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

    #sdpMLineIndex;

    get sdpMLineIndex() {
        return this.#sdpMLineIndex;
    }

    #sdpMid;

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

    #usernameFragment;

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
