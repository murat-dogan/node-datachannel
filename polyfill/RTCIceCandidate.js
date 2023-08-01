// @ts-check

const componentMap = {
    1: 'rtp',
    2: 'rtcp',
};

/**
 * @class
 * @implements {RTCIceCandidate}
 */
export default class {
    /**
     * @param  {RTCIceCandidateInit} init={}
     */
    constructor({ candidate, sdpMLineIndex, sdpMid, usernameFragment } = {}) {
        if (sdpMLineIndex == null && sdpMid == null) {
            throw new TypeError("Failed to construct 'RTCIceCandidate': sdpMid and sdpMLineIndex are both null.");
        }
        this.#candidate = candidate;
        this.#sdpMLineIndex = sdpMLineIndex ?? null;
        this.#sdpMid = sdpMid ?? null;
        this.#usernameFragment = usernameFragment ?? null;

        if (candidate && candidate.indexOf('candidate:') !== -1) {
            const interest = candidate.slice(candidate.indexOf('candidate:') + 10);

            /** @type {any[]} split */
            const [foundation, componentID, protocol, priority, ip, port, type, ...rest] = interest.split(' ');

            this.#foundation = foundation;
            this.#component = componentMap[componentID];

            this.#protocol = protocol;
            this.#priority = Number(priority);
            this.#address = ip;
            this.#port = Number(port);
            this.#type = type;

            if (type !== 'host') {
                const raddrIndex = rest.indexOf('raddr');
                if (raddrIndex !== -1) this.#relatedAddress = rest[raddrIndex + 1];

                const rportIndex = rest.indexOf('rport');
                if (rportIndex !== -1) this.#relatedPort = Number(rest[rportIndex + 1]);
            }
        }
    }

    #address;

    get address() {
        return this.#address ?? null;
    }

    #candidate;

    get candidate() {
        return this.#candidate || '';
    }

    #component = null;

    get component() {
        return this.#component;
    }

    #foundation;

    get foundation() {
        return this.#foundation ?? null;
    }

    #port;

    get port() {
        return this.#port ?? null;
    }

    #priority;

    get priority() {
        return this.#priority ?? null;
    }

    /** @type {RTCIceProtocol} */
    #protocol;

    get protocol() {
        return this.#protocol ?? null;
    }

    #relatedAddress = null;

    get relatedAddress() {
        return this.#relatedAddress;
    }

    #relatedPort;

    get relatedPort() {
        return this.#relatedPort ?? null;
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

    /** @type {RTCIceCandidateType} */
    #type;

    get type() {
        return this.#type ?? null;
    }

    #usernameFragment;

    get usernameFragment() {
        return this.#usernameFragment;
    }

    toJSON() {
        return {
            candidate: this.#candidate,
            sdpMLineIndex: this.#sdpMLineIndex,
            sdpMid: this.#sdpMid,
            usernameFragment: this.#usernameFragment,
        };
    }
}
