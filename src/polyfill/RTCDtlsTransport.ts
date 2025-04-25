import RTCIceTransport from './RTCIceTransport';

export default class RTCDtlsTransport extends EventTarget implements globalThis.RTCDtlsTransport {
    #pc: globalThis.RTCPeerConnection = null;
    #iceTransport = null;

    onstatechange: globalThis.RTCDtlsTransport['onstatechange'];
    onerror: globalThis.RTCDtlsTransport['onstatechange'];

    constructor({ pc }: { pc: RTCPeerConnection }) {
        super();
        this.#pc = pc;

        this.#iceTransport = new RTCIceTransport({ pc });

        // forward peerConnection events
        this.#pc.addEventListener('connectionstatechange', () => {
            const e = new Event('statechange');
            this.dispatchEvent(e);
            this.onstatechange?.(e);
        });
    }

    get iceTransport(): globalThis.RTCIceTransport {
        return this.#iceTransport;
    }

    get state(): globalThis.RTCDtlsTransportState {
        // reduce state from new, connecting, connected, disconnected, failed, closed, unknown
        // to RTCDtlsTRansport states new, connecting, connected, closed, failed
        if (this.#pc.connectionState === 'disconnected') return 'closed'
        return this.#pc.connectionState
    }

    getRemoteCertificates(): ArrayBuffer[] {
        // TODO: implement, not supported by all browsers anyways
        return [new ArrayBuffer(0)];
    }
}
