// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export default class RTCDtlsTransport extends EventTarget {
    constructor() {
        super();
    }

    #iceTransport = null;

    get iceTransport() {
        return this.#iceTransport;
    }

    #state = null;

    get state() {
        return this.#state;
    }

    onerror = noop;
    onstatechange = noop;

    getRemoteCertificates() {}
}
