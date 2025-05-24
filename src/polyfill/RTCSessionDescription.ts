// https://developer.mozilla.org/docs/Web/API/RTCSessionDescription
//
// Example usage
// const init = {
//     type: 'offer',
//     sdp: 'v=0\r\no=- 1234567890 1234567890 IN IP4 192.168.1.1\r\ns=-\r\nt=0 0\r\na=ice-ufrag:abcd\r\na=ice-pwd:efgh\r\n'
//   };

export default class RTCSessionDescription implements globalThis.RTCSessionDescriptionInit {
  #type: globalThis.RTCSdpType;
  #sdp: string;

  constructor(init: globalThis.RTCSessionDescriptionInit) {
    this.#type = init?.type;
    this.#sdp = init?.sdp ?? '';
  }

  get type(): globalThis.RTCSdpType {
    return this.#type;
  }

  set type(type) {
    if (type !== 'offer' && type !== 'answer' && type !== 'pranswer' && type !== 'rollback') {
      throw new TypeError(
        `Failed to set the 'type' property on 'RTCSessionDescription': The provided value '${type}' is not a valid enum value of type RTCSdpType.`,
      );
    }
    this.#type = type;
  }

  get sdp(): string {
    return this.#sdp;
  }

  toJSON(): globalThis.RTCSessionDescriptionInit {
    return {
      sdp: this.#sdp,
      type: this.#type,
    };
  }
}
