import * as exceptions from './Exception';
import { DataChannel } from '../lib/index';
import RTCPeerConnection from './RTCPeerConnection';
import { RTCErrorEvent } from './Events';

export default class RTCDataChannel extends EventTarget implements globalThis.RTCDataChannel {
    #dataChannel: DataChannel;
    #readyState: globalThis.RTCDataChannelState;
    #bufferedAmountLowThreshold: number = 0;
    #binaryType: BinaryType = 'blob';
    #maxPacketLifeTime: number | null;
    #maxRetransmits: number | null;
    #negotiated: boolean;
    #ordered: boolean;
    #pc: RTCPeerConnection;

    // events
    onbufferedamountlow: globalThis.RTCDataChannel['onbufferedamountlow'];
    onclose: globalThis.RTCDataChannel['onclose'];
    onclosing: globalThis.RTCDataChannel['onclosing'];
    onerror: globalThis.RTCDataChannel['onerror'];
    onmessage: globalThis.RTCDataChannel['onmessage'];
    onopen: globalThis.RTCDataChannel['onopen']

    constructor(dataChannel: DataChannel, opts: globalThis.RTCDataChannelInit = {}, pc: RTCPeerConnection) {
        super();

        this.#dataChannel = dataChannel;
        this.#readyState = this.#dataChannel.isOpen() ? 'open' : 'connecting';
        this.#maxPacketLifeTime = opts.maxPacketLifeTime ?? null;
        this.#maxRetransmits = opts.maxRetransmits ?? null;
        this.#negotiated = opts.negotiated ?? false;
        this.#ordered = opts.ordered ?? true;
        this.#pc = pc

        // forward dataChannel events
        this.#dataChannel.onOpen(() => {
            this.#readyState = 'open';
            this.dispatchEvent(new Event('open', {}));
        });


    // we need updated connectionstate, so this is delayed by a single event loop tick
    // this is fucked and wonky, needs to be made better
    this.#dataChannel.onClosed(() => setTimeout(() => {
        if (this.#readyState !== 'closed') {
          // this should be 'disconnected' but ldc doesn't support that
        if (this.#pc.connectionState === 'closed') {
            // if the remote connection suddently closes without closing dc first, throw this weird error
            this.dispatchEvent(new RTCErrorEvent('error', { error: new RTCError({ errorDetail: 'sctp-failure', sctpCauseCode: 12 }, 'User-Initiated Abort, reason=Close called') }))
        }
        this.#readyState = 'closing'
        this.dispatchEvent(new Event('closing'))
        this.#readyState = 'closed'
        }
        this.dispatchEvent(new Event('close'))
    }))

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

        this.#dataChannel.onMessage(message => {
            let data: Blob | ArrayBufferLike | string
            if (!ArrayBuffer.isView(message)) {
                data = message
            } else if (this.#binaryType === 'blob') {
                data = new Blob([message])
            } else {
                data = message.buffer
            }
            this.dispatchEvent(new MessageEvent('message', { data }))
        })

        // forward events to properties
        this.addEventListener('message', (e) => {
            if (this.onmessage) this.onmessage(e as MessageEvent);
        });
        this.addEventListener('bufferedamountlow', (e) => {
            if (this.onbufferedamountlow) this.onbufferedamountlow(e);
        });
        this.addEventListener('error', (e) => {
            if (this.onerror) this.onerror(e as RTCErrorEvent);
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

    get maxMessageSize (): number {
        return this.#dataChannel.maxMessageSize()
    }

    send(data: string | Blob | ArrayBuffer | ArrayBufferView | Buffer): void {
        if (this.#readyState !== 'open') {
            throw new exceptions.InvalidStateError(
                "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'",
            );
        }

        // Needs network error, type error implemented
        if (typeof data === 'string') {
            if (data.length > this.#dataChannel.maxMessageSize()) throw new TypeError('Max message size exceeded.')
            this.#dataChannel.sendMessage(data);
        } else if ('arrayBuffer' in data) {
            if (data.size > this.#dataChannel.maxMessageSize()) throw new TypeError('Max message size exceeded.')
            data.arrayBuffer().then((ab) => {
                this.#dataChannel.sendMessageBinary( process?.versions?.bun ? Buffer.from(ab) : new Uint8Array(ab));
            });
        } else if (data instanceof Uint8Array) {
            this.#dataChannel.sendMessageBinary(data);
        } else {
            if (data.byteLength > this.#dataChannel.maxMessageSize()) throw new TypeError('Max message size exceeded.')
            this.#dataChannel.sendMessageBinary( process?.versions?.bun ? Buffer.from(data as ArrayBuffer) : new Uint8Array(data as ArrayBuffer));
        }
    }

    close (): void {
        this.#readyState = 'closed'
        setTimeout(() => {
            if (this.#pc.connectionState === 'closed') {
                // if the remote connection suddently closes without closing dc first, throw this weird error
                // can this be done better?
                this.dispatchEvent(new RTCErrorEvent('error', { error: new RTCError({ errorDetail: 'sctp-failure', sctpCauseCode: 12 }, 'User-Initiated Abort, reason=Close called') }))
            }
        })

        this.#dataChannel.close()
    }
}
