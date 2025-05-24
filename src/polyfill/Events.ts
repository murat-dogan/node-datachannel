import RTCDataChannel from './RTCDataChannel';

export class RTCPeerConnectionIceEvent
  extends Event
  implements globalThis.RTCPeerConnectionIceEvent
{
  #candidate: globalThis.RTCIceCandidate;

  constructor(candidate: globalThis.RTCIceCandidate) {
    super('icecandidate');

    this.#candidate = candidate;
  }

  get candidate(): globalThis.RTCIceCandidate {
    return this.#candidate;
  }
}

export class RTCDataChannelEvent extends Event implements globalThis.RTCDataChannelEvent {
  #channel: RTCDataChannel;

  constructor(type: string, eventInitDict: globalThis.RTCDataChannelEventInit) {
    super(type);

    if (type && !eventInitDict.channel) throw new TypeError('channel member is required');

    this.#channel = eventInitDict?.channel as RTCDataChannel;
  }

  get channel(): RTCDataChannel {
    return this.#channel;
  }
}
