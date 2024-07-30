// https://developer.mozilla.org/docs/Web/API/RTCIceCandidate
//
// Example: candidate:123456 1 UDP 123456 192.168.1.1 12345 typ host raddr=10.0.0.1 rport=54321 generation 0

import 'node-domexception';

export default class RTCIceCandidate {
    #address: string | null;
    #candidate: string;
    #component: RTCIceComponent | null;
    #foundation: string | null;
    #port: number | null;
    #priority: number | null;
    #protocol: RTCIceProtocol | null;
    #relatedAddress: string | null;
    #relatedPort: number | null;
    #sdpMLineIndex: number | null;
    #sdpMid: string | null;
    #tcpType: RTCIceTcpCandidateType | null;
    #type: RTCIceCandidateType | null;
    #usernameFragment: string | null;

    constructor({ candidate, sdpMLineIndex, sdpMid, usernameFragment }: RTCIceCandidateInit) {
        if (sdpMLineIndex == null && sdpMid == null)
            throw new TypeError('At least one of sdpMLineIndex or sdpMid must be specified');

        this.#candidate = candidate === null ? 'null' : candidate ?? '';
        this.#sdpMLineIndex = sdpMLineIndex ?? null;
        this.#sdpMid = sdpMid ?? null;
        this.#usernameFragment = usernameFragment ?? null;

        if (candidate) {
            const fields = candidate.split(' ');
            this.#foundation = fields[0].replace('candidate:', ''); // remove text candidate:
            this.#component = fields[1] == '1' ? 'rtp' : 'rtcp';
            this.#protocol = fields[2] as RTCIceProtocol;
            this.#priority = parseInt(fields[3], 10);
            this.#address = fields[4];
            this.#port = parseInt(fields[5], 10);
            this.#type = fields[7] as RTCIceCandidateType;
            this.#tcpType = null;
            this.#relatedAddress = null;
            this.#relatedPort = null;

            // Parse the candidate string to extract relatedPort and relatedAddress
            for (let i = 8; i < fields.length; i++) {
                const field = fields[i];
                if (field === 'raddr') {
                    this.#relatedAddress = fields[i + 1];
                } else if (field === 'rport') {
                    this.#relatedPort = parseInt(fields[i + 1], 10);
                }

                if (this.#protocol === 'tcp' && field === 'tcptype') {
                    this.#tcpType = fields[i + 1] as RTCIceTcpCandidateType;
                }
            }
        }
    }

    get address(): string | null {
        return this.#address || null;
    }

    get candidate(): string {
        return this.#candidate;
    }

    get component(): RTCIceComponent | null {
        return this.#component;
    }

    get foundation(): string | null {
        return this.#foundation || null;
    }

    get port(): number | null {
        return this.#port || null;
    }

    get priority(): number | null {
        return this.#priority || null;
    }

    get protocol(): RTCIceProtocol | null {
        return this.#protocol || null;
    }

    get relatedAddress(): string | null {
        return this.#relatedAddress;
    }

    get relatedPort(): number | null {
        return this.#relatedPort || null;
    }

    get sdpMLineIndex(): number | null {
        return this.#sdpMLineIndex;
    }

    get sdpMid(): string | null {
        return this.#sdpMid;
    }

    get tcpType(): RTCIceTcpCandidateType | null {
        return this.#tcpType;
    }

    get type(): RTCIceCandidateType | null {
        return this.#type || null;
    }

    get usernameFragment(): string | null {
        return this.#usernameFragment;
    }

    toJSON(): RTCIceCandidateInit {
        return {
            candidate: this.#candidate,
            sdpMLineIndex: this.#sdpMLineIndex,
            sdpMid: this.#sdpMid,
            usernameFragment: this.#usernameFragment,
        };
    }
}
