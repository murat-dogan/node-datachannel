// @ts-check
import { text2arr } from 'uint8-util';
// DOMException has existed for quite a while, but was only exposed in node 17 and above, this is a hack to get it early in engines 10 or above tho we only support since node 15 for event target

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
/**
 * @class
 * @implements {RTCDataChannel}
 */
export default class extends EventTarget {
    /**
     * @param {import("../lib/index.d.ts").DataChannel} dataChannel
     * @param {any} opts
     */
    constructor(dataChannel, opts = {}) {
        super();

        this.#dataChannel = dataChannel;
        this.#readyState = 'connecting';
        this.#bufferedAmountLowThreshold = 0;

        this.#binaryType = 'arraybuffer';

        this.#dataChannel.onOpen(() => {
            this.#readyState = 'open';
            this.dispatchEvent(new Event('open'));
        });
        this.#dataChannel.onClosed(() => {
            this.#readyState = 'closed';
            this.dispatchEvent(new Event('close'));
        });
        this.#dataChannel.onError((/** @type {string | undefined} */ msg) => {
            this.#readyState = 'closed';
            this.dispatchEvent(
                new RTCErrorEvent('error', {
                    error: new RTCError(
                        {
                            errorDetail: 'data-channel-failure',
                        },
                        msg,
                    ),
                }),
            );
        });
        this.#dataChannel.onBufferedAmountLow(() => {
            this.dispatchEvent(new Event('bufferedamountlow'));
        });
        this.#dataChannel.onMessage((/** @type {string | Uint8Array} */ data) => {
            if (typeof data === 'string') {
                data = text2arr(data);
            }

            this.dispatchEvent(new MessageEvent('message', { data }));
        });

        // forward events to properties
        this.addEventListener('message', this.onmessage);
        this.addEventListener('bufferedamountlow', this.onbufferedamountlow);
        this.addEventListener('error', this.onerror);
        this.addEventListener('close', this.onclose);
        this.addEventListener('closing', this.onclosing);
        this.addEventListener('open', this.onopen);

        this.#maxPacketLifeTime = opts.maxPacketLifeTime ?? null;
        this.#maxRetransmits = opts.maxRetransmits ?? null;
        this.#negotiated = opts.negotiated ?? false;
        this.#ordered = opts.ordered ?? true;
    }

    #dataChannel;
    /** @type {BinaryType} */
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

    get bufferedAmount() {
        return this.#dataChannel.bufferedAmount();
    }

    #bufferedAmountLowThreshold = 0;

    get bufferedAmountLowThreshold() {
        return this.#bufferedAmountLowThreshold;
    }

    set bufferedAmountLowThreshold(value) {
        const number = Number(value) || 0;
        this.#bufferedAmountLowThreshold = number;
        this.#dataChannel.setBufferedAmountLowThreshold(number);
    }

    get id() {
        return this.#dataChannel.getId();
    }

    get label() {
        return this.#dataChannel.getLabel();
    }

    #maxPacketLifeTime = 0;

    get maxPacketLifeTime() {
        return this.#maxPacketLifeTime;
    }

    #maxRetransmits = 0;

    get maxRetransmits() {
        return this.#maxRetransmits;
    }

    #negotiated = false;

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

    #ordered = false;

    get ordered() {
        return this.#ordered;
    }

    get protocol() {
        return this.#dataChannel.getProtocol();
    }

    // connecting, open, closing, or closed
    /** @type {RTCDataChannelState} */
    #readyState = 'connecting';

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

        // Needs network error, type error implemented
        if (typeof data === 'string') {
            this.#dataChannel.sendMessage(data);
        } else if (data instanceof Blob) {
            data.arrayBuffer().then((ab) => {
                this.#dataChannel.sendMessageBinary(new Uint8Array(ab));
            });
        } else {
            this.#dataChannel.sendMessageBinary(new Uint8Array(data));
        }
    }

    close() {
        this.#readyState = 'closing';
        this.dispatchEvent(new Event('closing'));

        this.#dataChannel.close();
    }
}
