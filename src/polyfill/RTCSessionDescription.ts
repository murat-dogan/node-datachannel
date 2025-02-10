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
        this.#type = init ? init.type : null;
        this.#sdp = init ? init.sdp : null;
    }

    get type(): globalThis.RTCSdpType {
        return this.#type;
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
