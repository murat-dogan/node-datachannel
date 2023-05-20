import DOMException from 'node-domexception';
// DOMException has existed for quite a while, but was only exposed in node 17 and above, this is a hack to get it early in engines 10 or above tho we only support since node 15 for event target

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export default class RTCDataChannel extends EventTarget {
    constructor() {
        super();
    }

    #_binaryType = 'blob';

    set binaryType(type) {
        if (type !== 'blob' && type !== 'arraybuffer') {
            throw new DOMException(
                "Failed to set the 'binaryType' property on 'RTCDataChannel': Unknown binary type : " + type,
                'TypeMismatchError',
            );
        }
        this.#_binaryType = type;
    }
    get binaryType() {
        return this.#_binaryType;
    }

    #_bufferedAmount = 0;

    get bufferedAmount() {
        return this.#_bufferedAmount;
    }

    #_bufferedAmountLowThreshold = 0;

    get bufferedAmountLowThreshold() {
        return this.#_bufferedAmountLowThreshold;
    }

    set bufferedAmountLowThreshold(value) {
        const number = Number(value) || 0;
        this.#_bufferedAmountLowThreshold = number;
    }

    #_id = 0;

    get id() {
        return this.#_id;
    }

    #_label = 0;

    get label() {
        return this.#_label;
    }

    #_maxPacketLifeTime = 0;

    get maxPacketLifeTime() {
        return this.#_maxPacketLifeTime;
    }

    #_maxRetransmits = 0;

    get maxRetransmits() {
        return this.#_maxRetransmits;
    }

    #_negotiated = 0;

    get negotiated() {
        return this.#_negotiated;
    }

    // needs to be called with .bind(this)
    onbufferedamountlow = noop;
    onclose = noop;
    onclosing = noop;
    onerror = noop;
    onmessage = noop;
    onopen = noop;

    #_ordered = 0;

    get ordered() {
        return this.#_ordered;
    }

    #_protocol = 0;

    get protocol() {
        return this.#_protocol;
    }

    // connecting, open, closing, or closed
    #_readyState = 0;

    get readyState() {
        return this.#_readyState;
    }

    send(data) {
        if (this.#_readyState !== 'open') {
            throw new DOMException(
                "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'",
                'InvalidStateError',
            );
        }
        // Needs network error, type error implemented and strict data type checking.
        // This may be a string, a Blob, an ArrayBuffer, a TypedArray or a DataView object.
    }
}
