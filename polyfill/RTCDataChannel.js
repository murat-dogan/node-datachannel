import DOMException from 'node-domexception';
// DOMException has existed for quite a while, but was only exposed in node 17 and above, this is a hack to get it early in engines 10 or above tho we only support since node 15 for event target

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export default class RTCDataChannel extends EventTarget {
    constructor() {
        super();
    }

    #binaryType = 'blob';

    set binaryType(type) {
        if (type !== 'blob' && type !== 'arraybuffer') {
            throw new DOMException(
                "Failed to set the 'binaryType' property on 'RTCDataChannel': Unknown binary type : " + type,
                'TypeMismatchError',
            );
        }
        this.#binaryType = type;
    }
    get binaryType() {
        return this.#binaryType;
    }

    #bufferedAmount = 0;

    get bufferedAmount() {
        return this.#bufferedAmount;
    }

    #bufferedAmountLowThreshold = 0;

    get bufferedAmountLowThreshold() {
        return this.#bufferedAmountLowThreshold;
    }

    set bufferedAmountLowThreshold(value) {
        const number = Number(value) || 0;
        this.#bufferedAmountLowThreshold = number;
    }

    #id = 0;

    get id() {
        return this.#id;
    }

    #label = 0;

    get label() {
        return this.#label;
    }

    #maxPacketLifeTime = 0;

    get maxPacketLifeTime() {
        return this.#maxPacketLifeTime;
    }

    #maxRetransmits = 0;

    get maxRetransmits() {
        return this.#maxRetransmits;
    }

    #negotiated = 0;

    get negotiated() {
        return this.#negotiated;
    }

    // needs to be called with .bind(this)
    onbufferedamountlow = noop;
    onclose = noop;
    onclosing = noop;
    onerror = noop;
    onmessage = noop;
    onopen = noop;

    #ordered = 0;

    get ordered() {
        return this.#ordered;
    }

    #protocol = 0;

    get protocol() {
        return this.#protocol;
    }

    // connecting, open, closing, or closed
    #readyState = 0;

    get readyState() {
        return this.#readyState;
    }

    send(data) {
        if (this.#readyState !== 'open') {
            throw new DOMException(
                "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'",
                'InvalidStateError',
            );
        }
        // Needs network error, type error implemented and strict data type checking.
        // This may be a string, a Blob, an ArrayBuffer, a TypedArray or a DataView object.
    }
}
