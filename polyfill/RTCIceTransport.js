// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export default class RTCIceTransport extends EventTarget {
    constructor() {
        super();
    }

    #component = null;

    get component() {
        return this.#component;
    }

    #gatheringState = null;

    get gatheringState() {
        return this.#gatheringState;
    }

    #role = null;

    get role() {
        return this.#role;
    }

    #state = null;

    get state() {
        return this.#state;
    }
    getLocalCandidates() {}

    getLocalParameters() {}

    getRemoteCandidates() {}

    getRemoteParameters() {}

    getSelectedCandidatePair() {}

    ongatheringstatechange = noop;
    onselectedcandidatepairchange = noop;
    onstatechange = noop;
}
