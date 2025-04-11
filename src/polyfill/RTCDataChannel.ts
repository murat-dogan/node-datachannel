/* eslint-disable @typescript-eslint/no-explicit-any */
import * as exceptions from './Exception';
import { DataChannel } from '../lib/index';

export default class RTCDataChannel extends EventTarget implements globalThis.RTCDataChannel {
    #dataChannel: DataChannel;
    #readyState: globalThis.RTCDataChannelState;
    #bufferedAmountLowThreshold: number;
    #binaryType: BinaryType;
    #maxPacketLifeTime: number | null;
    #maxRetransmits: number | null;
    #negotiated: boolean;
    #ordered: boolean;

    #closeRequested = false;

    // events
    onbufferedamountlow: ((this: globalThis.RTCDataChannel, ev: Event) => any) | null;
    onclose: ((this: globalThis.RTCDataChannel, ev: Event) => any) | null;
    onclosing: ((this: globalThis.RTCDataChannel, ev: Event) => any) | null;
    onerror: ((this: globalThis.RTCDataChannel, ev: Event) => any) | null;
    onmessage: ((this: globalThis.RTCDataChannel, ev: MessageEvent) => any) | null;
    onopen: ((this: globalThis.RTCDataChannel, ev: Event) => any) | null;

    constructor(dataChannel: DataChannel, opts: globalThis.RTCDataChannelInit = {}) {
        super();

        this.#dataChannel = dataChannel;
        this.#binaryType = 'blob';
        this.#readyState = this.#dataChannel.isOpen() ? 'open' : 'connecting';
        this.#bufferedAmountLowThreshold = 0;
        this.#maxPacketLifeTime = opts.maxPacketLifeTime || null;
        this.#maxRetransmits = opts.maxRetransmits || null;
        this.#negotiated = opts.negotiated || false;
        this.#ordered = opts.ordered || true;

        // forward dataChannel events
        this.#dataChannel.onOpen(() => {
            this.#readyState = 'open';
            this.dispatchEvent(new Event('open', {}));
        });

        this.#dataChannel.onClosed(() => {
            // Simulate closing event
            if (!this.#closeRequested) {
                this.#readyState = 'closing';
                this.dispatchEvent(new Event('closing'));
            }

            setImmediate(() => {
                this.#readyState = 'closed';
                this.dispatchEvent(new Event('close'));
            });
        });

        this.#dataChannel.onError((msg) => {
            this.dispatchEvent(
                new globalThis.RTCErrorEvent('error', {
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
                if (this.binaryType == 'arraybuffer')
                    data = data.buffer;
                else
                    data = Buffer.from(data.buffer);
            }

            this.dispatchEvent(new MessageEvent('message', { data }));
        });

        // forward events to properties
        this.addEventListener('message', (e) => {
            if (this.onmessage) this.onmessage(e as MessageEvent);
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

    get binaryType(): BinaryType {
        return this.#binaryType;
    }

    get bufferedAmount(): number {
        return this.#dataChannel.bufferedAmount();
    }

    get bufferedAmountLowThreshold(): number {
        return this.#bufferedAmountLowThreshold;
    }

    set bufferedAmountLowThreshold(value) {
        const number = Number(value) || 0;
        this.#bufferedAmountLowThreshold = number;
        this.#dataChannel.setBufferedAmountLowThreshold(number);
    }

    get id(): number | null {
        return this.#dataChannel.getId();
    }

    get label(): string {
        return this.#dataChannel.getLabel();
    }

    get maxPacketLifeTime(): number | null {
        return this.#maxPacketLifeTime;
    }

    get maxRetransmits(): number | null {
        return this.#maxRetransmits;
    }

    get negotiated(): boolean {
        return this.#negotiated;
    }

    get ordered(): boolean {
        return this.#ordered;
    }

    get protocol(): string {
        return this.#dataChannel.getProtocol();
    }

    get readyState(): globalThis.RTCDataChannelState {
        return this.#readyState;
    }

    send(data): void {
        if (this.#readyState !== 'open') {
            throw new exceptions.InvalidStateError(
                "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'",
            );
        }

        // Needs network error, type error implemented
        if (typeof data === 'string') {
            this.#dataChannel.sendMessage(data);
        } else if (data instanceof Blob) {
            data.arrayBuffer().then((ab) => {
                if (process?.versions?.bun) {
                    this.#dataChannel.sendMessageBinary(Buffer.from(ab));
                } else {
                    this.#dataChannel.sendMessageBinary(new Uint8Array(ab));
                }
            });
        } else if (data instanceof Uint8Array) {
            this.#dataChannel.sendMessageBinary(data);
        } else {
            if (process?.versions?.bun) {
                this.#dataChannel.sendMessageBinary(Buffer.from(data));
            } else {
                this.#dataChannel.sendMessageBinary(new Uint8Array(data));
            }
        }
    }

    close(): void {
        this.#closeRequested = true;
        setImmediate(() => {
            this.#dataChannel.close();
        });
    }
}
