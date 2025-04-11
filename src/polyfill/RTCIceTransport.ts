/* eslint-disable @typescript-eslint/no-explicit-any */
import RTCIceCandidate from './RTCIceCandidate';

export default class RTCIceTransport extends EventTarget implements globalThis.RTCIceTransport {
    #pc: globalThis.RTCPeerConnection = null;
    #extraFunctions = null;

    ongatheringstatechange: ((this: globalThis.RTCIceTransport, ev: Event) => any) | null = null;
    onselectedcandidatepairchange: ((this: globalThis.RTCIceTransport, ev: Event) => any) | null = null;
    onstatechange: ((this: globalThis.RTCIceTransport, ev: Event) => any) | null = null;

    constructor(init: { pc: globalThis.RTCPeerConnection, extraFunctions }) {
        super();
        this.#pc = init.pc;
        this.#extraFunctions = init.extraFunctions;

        // forward peerConnection events
        this.#pc.addEventListener('icegatheringstatechange', () => {
            this.dispatchEvent(new Event('gatheringstatechange'));
        });
        this.#pc.addEventListener('iceconnectionstatechange', () => {
            this.dispatchEvent(new Event('statechange'));
        });

        // forward events to properties
        this.addEventListener('gatheringstatechange', (e) => {
            if (this.ongatheringstatechange) this.ongatheringstatechange(e);
        });
        this.addEventListener('statechange', (e) => {
            if (this.onstatechange) this.onstatechange(e);
        });
    }

    get component(): globalThis.RTCIceComponent {
        const cp = this.getSelectedCandidatePair();
        if (!cp) return null;
        return cp.local.component;
    }

    get gatheringState(): globalThis.RTCIceGatheringState {
        return this.#pc ? this.#pc.iceGatheringState : 'new';
    }

    get role(): string {
        return this.#pc.localDescription.type == 'offer' ? 'controlling' : 'controlled';
    }

    get state(): globalThis.RTCIceTransportState {
        return this.#pc ? this.#pc.iceConnectionState : 'new';
    }

    getLocalCandidates(): globalThis.RTCIceCandidate[] {
        return this.#pc ? this.#extraFunctions.localCandidates() : [];
    }

    getLocalParameters(): any {
        /** */
    }

    getRemoteCandidates(): globalThis.RTCIceCandidate[] {
        return this.#pc ? this.#extraFunctions.remoteCandidates() : [];
    }

    getRemoteParameters(): any {
        /** */
    }

    getSelectedCandidatePair(): globalThis.RTCIceCandidatePair | null {
        const cp = this.#extraFunctions.selectedCandidatePair();
        if (!cp) return null;
        return {
            local: new RTCIceCandidate({
                candidate: cp.local.candidate,
                sdpMid: cp.local.mid,
            }),
            remote: new RTCIceCandidate({
                candidate: cp.remote.candidate,
                sdpMid: cp.remote.mid,
            }),
        };
    }
}
