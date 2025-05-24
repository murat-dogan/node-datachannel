/* eslint-disable @typescript-eslint/no-explicit-any */
import RTCIceCandidate from './RTCIceCandidate';

export default class RTCIceTransport extends EventTarget implements globalThis.RTCIceTransport {
  #pc: globalThis.RTCPeerConnection = null;
  #extraFunctions = null;

  ongatheringstatechange: globalThis.RTCIceTransport['ongatheringstatechange'] = null;
  onselectedcandidatepairchange: globalThis.RTCIceTransport['onselectedcandidatepairchange'] = null;
  onstatechange: globalThis.RTCIceTransport['onstatechange'] = null;

  constructor(init: { pc: globalThis.RTCPeerConnection; extraFunctions }) {
    super();
    this.#pc = init.pc;
    this.#extraFunctions = init.extraFunctions;

    this.#pc.addEventListener('icegatheringstatechange', () => {
      const e = new Event('gatheringstatechange');
      this.dispatchEvent(e);
      this.ongatheringstatechange?.(e);
    });
    this.#pc.addEventListener('iceconnectionstatechange', () => {
      const e = new Event('statechange');
      this.dispatchEvent(e);
      this.onstatechange?.(e);
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
