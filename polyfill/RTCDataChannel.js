import DOMException from 'node-domexception';

export default class _RTCDataChannel extends EventTarget {
    #dataChannel;
    #readyState;
    #bufferedAmountLowThreshold;
    #binaryType;
    #maxPacketLifeTime;
    #maxRetransmits;
    #negotiated;
    #ordered;

    onbufferedamountlow;
    onclose;
    onclosing;
    onerror;
    onmessage;
    onopen;

    constructor(dataChannel, opts = {}) {
        super();

        this.#dataChannel = dataChannel;
        this.#binaryType = 'arraybuffer';
        this.#readyState = this.#dataChannel.isOpen() ? 'open' : 'connecting';
        this.#bufferedAmountLowThreshold = 0;
        this.#maxPacketLifeTime = opts.maxPacketLifeTime || null;
        this.#maxRetransmits = opts.maxRetransmits || null;
        this.#negotiated = opts.negotiated || false;
        this.#ordered = opts.ordered || true;

        // forward dataChannel events
        this.#dataChannel.onOpen(() => {
            this.#readyState = 'open';
            this.dispatchEvent(new Event('open'));
        });

        this.#dataChannel.onClosed(() => {
            this.#readyState = 'closed';
            this.dispatchEvent(new Event('close'));
        });

        this.#dataChannel.onError((msg) => {
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

        this.#dataChannel.onMessage((data) => {
            if (ArrayBuffer.isView(data)) {
                data = data.buffer;
            }

            this.dispatchEvent(new MessageEvent('message', { data }));
        });

        // forward events to properties
        this.addEventListener('message', (e) => {
            if (this.onmessage) this.onmessage(e);
        });
        this.addEventListener('bufferedamountlow', (e) => {
            if (this.onbufferedamountlow) this.onbufferedamountlow(e);
        });
        this.addEventListener('error', (e) => {
            if (this.onerror) this.onerror(e);
        });
        this.addEventListener('close', (e) => {
            if (this.onclose) this.onclose(e);
        });
        this.addEventListener('closing', (e) => {
            if (this.onclosing) this.onclosing(e);
        });
        this.addEventListener('open', (e) => {
            if (this.onopen) this.onopen(e);
        });
    }

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
        return this.#dataChannel?.bufferedAmount() || 0;
    }

    get bufferedAmountLowThreshold() {
        return this.#bufferedAmountLowThreshold;
    }

    set bufferedAmountLowThreshold(value) {
        const number = Number(value) || 0;
        this.#bufferedAmountLowThreshold = number;
        this.#dataChannel?.setBufferedAmountLowThreshold(number);
    }

    get id() {
        return this.#dataChannel?.getId() || null;
    }

    get label() {
        return this.#dataChannel?.getLabel() || null;
    }

    get maxPacketLifeTime() {
        return this.#maxPacketLifeTime;
    }

    get maxRetransmits() {
        return this.#maxRetransmits;
    }

    get negotiated() {
        return this.#negotiated;
    }

    get ordered() {
        return this.#ordered;
    }

    get protocol() {
        return this.#dataChannel?.getProtocol() || '';
    }

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
        this.#dataChannel = null;
    }
}
