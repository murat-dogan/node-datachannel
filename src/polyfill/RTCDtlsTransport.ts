/* eslint-disable @typescript-eslint/no-explicit-any */
import RTCIceTransport from './RTCIceTransport';
import RTCPeerConnection from './RTCPeerConnection';

export default class RTCDtlsTransport extends EventTarget implements globalThis.RTCDtlsTransport {
    #pc: RTCPeerConnection = null;
    #iceTransport = null;

    onstatechange: ((this: RTCDtlsTransport, ev: Event) => any) | null = null;
    onerror: ((this: RTCDtlsTransport, ev: Event) => any) | null = null;

    constructor(init: { pc: RTCPeerConnection, extraFunctions }) {
        super();
        this.#pc = init.pc;

        this.#iceTransport = new RTCIceTransport({ pc: init.pc, extraFunctions: init.extraFunctions });

        // forward peerConnection events
        this.#pc.addEventListener('connectionstatechange', () => {
            this.dispatchEvent(new Event('statechange'));
        });

        // forward events to properties
        this.addEventListener('statechange', (e) => {
            if (this.onstatechange) this.onstatechange(e);
        });
    }

    get iceTransport(): RTCIceTransport {
        return this.#iceTransport;
    }

    get state(): RTCDtlsTransportState {
        // reduce state from new, connecting, connected, disconnected, failed, closed, unknown
        // to RTCDtlsTRansport states new, connecting, connected, closed, failed
        let state = this.#pc ? this.#pc.connectionState : 'new';
        if (state === 'disconnected') {
            state = 'closed';
        }
        return state;
    }

    getRemoteCertificates(): ArrayBuffer[] {
        // TODO: implement
        return [new ArrayBuffer(0)];
    }
}
