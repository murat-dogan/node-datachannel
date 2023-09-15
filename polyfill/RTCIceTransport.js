export default class _RTCIceTransport extends EventTarget {
    #component = null;
    #gatheringState = null;
    #role = null;
    #state = null;

    ongatheringstatechange = createEmptyFunction();
    onselectedcandidatepairchange = createEmptyFunction();
    onstatechange = createEmptyFunction();

    constructor() {
        super();
    }

    get component() {
        return this.#component;
    }

    get gatheringState() {
        return this.#gatheringState;
    }

    get role() {
        return this.#role;
    }

    get state() {
        return this.#state;
    }
    getLocalCandidates() {
        /** */
    }

    getLocalParameters() {
        /** */
    }

    getRemoteCandidates() {
        /** */
    }

    getRemoteParameters() {
        /** */
    }

    getSelectedCandidatePair() {
        /** */
    }
}

function createEmptyFunction() {
    return () => {
        /** */
    };
}
