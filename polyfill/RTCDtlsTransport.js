export default class _RTCDtlsTransport extends EventTarget {
    #iceTransport = null;
    #state = null;

    onerror = createEmptyFunction();
    onstatechange = createEmptyFunction();

    constructor() {
        super();
    }

    get iceTransport() {
        return this.#iceTransport;
    }

    get state() {
        return this.#state;
    }

    getRemoteCertificates() {
        /** */
    }
}

function createEmptyFunction() {
    return () => {
        /** */
    };
}
