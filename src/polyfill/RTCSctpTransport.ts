/* eslint-disable @typescript-eslint/no-explicit-any */
import RTCDtlsTransport from './RTCDtlsTransport';
import RTCPeerConnection from './RTCPeerConnection';

export default class RTCSctpTransport extends EventTarget implements globalThis.RTCSctpTransport {
  #pc: RTCPeerConnection = null;
  #transport: globalThis.RTCDtlsTransport = null;

  onstatechange: globalThis.RTCSctpTransport['onstatechange'] = null;

  constructor(initial: { pc: RTCPeerConnection }) {
    super();
    this.#pc = initial.pc;

    this.#transport = new RTCDtlsTransport({
      pc: initial.pc,
    });

    this.#pc.addEventListener('connectionstatechange', () => {
      const e = new Event('statechange');
      this.dispatchEvent(e);
      this.onstatechange?.(e);
    });
  }

  get maxChannels(): number | null {
    if (this.state !== 'connected') return null;
    return this.#pc.ext_maxDataChannelId;
  }

  get maxMessageSize(): number {
    if (this.state !== 'connected') return null;
    return this.#pc?.ext_maxMessageSize ?? 65536;
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
