/* eslint-disable @typescript-eslint/no-explicit-any */
import RTCDtlsTransport from './RTCDtlsTransport';

export default class RTCSctpTransport extends EventTarget implements globalThis.RTCSctpTransport {
    #pc: globalThis.RTCPeerConnection = null;
    #extraFunctions = null;
    #transport: globalThis.RTCDtlsTransport = null;

    onstatechange: ((this: globalThis.RTCSctpTransport, ev: Event) => any) | null = null;

    constructor(initial: { pc: globalThis.RTCPeerConnection, extraFunctions }) {
        super();
        this.#pc = initial.pc;
        this.#extraFunctions = initial.extraFunctions;

        this.#transport = new RTCDtlsTransport({ pc: initial.pc, extraFunctions: initial.extraFunctions });

        // forward peerConnection events
        this.#pc.addEventListener('connectionstatechange', () => {
            this.dispatchEvent(new Event('statechange'));
        });

        // forward events to properties
        this.addEventListener('statechange', (e) => {
            if (this.onstatechange) this.onstatechange(e);
        });
    }

    get maxChannels(): number | null {
        if (this.state !== 'connected') return null;
        return this.#pc ? this.#extraFunctions.maxDataChannelId() : 0;
    }

    get maxMessageSize(): number {
        if (this.state !== 'connected') return null;
        return this.#pc ? this.#extraFunctions.maxMessageSize() : 0;
    }

    get state(): globalThis.RTCSctpTransportState {
        // reduce state from new, connecting, connected, disconnected, failed, closed, unknown
        // to RTCSctpTransport states connecting, connected, closed
        let state = this.#pc.connectionState;
        if (state === 'new' || state === 'connecting') {
            state = 'connecting';
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
            state = 'closed';
        }
        return state;
    }

    get transport(): globalThis.RTCDtlsTransport {
        return this.#transport;
    }
}
