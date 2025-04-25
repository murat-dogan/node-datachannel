import RTCIceCandidate from './RTCIceCandidate';
import RTCPeerConnection from './RTCPeerConnection';

export default class RTCIceTransport extends EventTarget implements globalThis.RTCIceTransport {
    #pc: RTCPeerConnection = null;

    ongatheringstatechange: globalThis.RTCIceTransport['ongatheringstatechange'];
    onselectedcandidatepairchange: globalThis.RTCIceTransport['onselectedcandidatepairchange'];
    onstatechange: globalThis.RTCIceTransport['onstatechange'];

    constructor({ pc }: { pc: RTCPeerConnection }) {
        super();
        this.#pc = pc;

        // forward peerConnection events
        pc.addEventListener('icegatheringstatechange', () => {
            const e = new Event('gatheringstatechange')
            this.dispatchEvent(e)
            this.ongatheringstatechange?.(e)
        });
        pc.addEventListener('iceconnectionstatechange', () => {
            const e = new Event('statechange')
            this.dispatchEvent(e)
            this.onstatechange?.(e)
        });
    }

    get component(): globalThis.RTCIceComponent {
        const cp = this.getSelectedCandidatePair();
        if (!cp?.local) return null;
        return cp.local.component;
    }

    get gatheringState(): globalThis.RTCIceGatheringState {
        return this.#pc.iceGatheringState;
    }

    get role(): globalThis.RTCIceRole {
        return this.#pc.localDescription.type == 'offer' ? 'controlling' : 'controlled';
    }

    get state(): globalThis.RTCIceTransportState {
        return this.#pc.iceConnectionState;
    }

    getLocalCandidates(): globalThis.RTCIceCandidate[] {
        return this.#pc.localCandidates;
    }

    getLocalParameters(): RTCIceParameters | null {
        return new RTCIceParameters(new RTCIceCandidate({ candidate: this.#pc.getSelectedCandidatePair().local.candidate, sdpMLineIndex: 0 }))
    }

    getRemoteCandidates(): globalThis.RTCIceCandidate[] {
        return this.#pc.remoteCandidates;
    }

    getRemoteParameters(): RTCIceParameters | null {
        return new RTCIceParameters(new RTCIceCandidate({ candidate: this.#pc.getSelectedCandidatePair().remote.candidate, sdpMLineIndex: 0 }))
    }

    getSelectedCandidatePair(): globalThis.RTCIceCandidatePair | null {
        const cp = this.#pc.getSelectedCandidatePair();
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


export class RTCIceParameters implements globalThis.RTCIceParameters {
    usernameFragment = ''
    password = ''
    constructor ({ usernameFragment, password = '' }) {
        this.usernameFragment = usernameFragment
        this.password = password
    }
}
