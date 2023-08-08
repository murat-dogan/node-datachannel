// https://developer.mozilla.org/docs/Web/API/RTCIceCandidate
//
// Example: candidate:123456 1 UDP 123456 192.168.1.1 12345 typ host raddr=10.0.0.1 rport=54321 generation 0

export default class _RTCIceCandidate {
    constructor({ candidate, sdpMLineIndex, sdpMid, usernameFragment }) {
        if (sdpMLineIndex == null && sdpMid == null) {
            throw new Error('Failed to construct "RTCIceCandidate": sdpMid and sdpMLineIndex are both null.');
        }
        this.candidate = candidate;
        this.sdpMLineIndex = sdpMLineIndex ?? null;
        this.sdpMid = sdpMid ?? null;
        this.usernameFragment = usernameFragment ?? null;

        if (candidate) {
            const fields = candidate.split(' ');
            this.foundation = fields[0];
            this.component = fields[1];
            this.protocol = fields[2];
            this.priority = parseInt(fields[3], 10);
            this.ip = fields[4];
            this.port = parseInt(fields[5], 10);
            this.type = fields[7];
            if (fields[6] === 'typ') {
                this.tcpType = null;
            } else if (fields[6] === 'tcp') {
                this.tcpType = fields[7];
                this.type = fields[8];
            }

            // Parse the candidate string to extract relatedPort and relatedAddress
            for (let i = 9; i < fields.length; i++) {
                const field = fields[i];
                if (field.startsWith('raddr')) {
                    this.relatedAddress = field.split('=')[1];
                } else if (field.startsWith('rport')) {
                    this.relatedPort = parseInt(field.split('=')[1], 10);
                }
            }
        }
    }

    get address() {
        return this.address || null;
    }

    get candidate() {
        return this.candidate || '';
    }

    get component() {
        return this.component;
    }

    get foundation() {
        return this.foundation || null;
    }

    get port() {
        return this.port || null;
    }

    get priority() {
        return this.priority || null;
    }

    get protocol() {
        return this.protocol || null;
    }

    get relatedAddress() {
        return this.relatedAddress;
    }

    get relatedPort() {
        return this.relatedPort || null;
    }

    get sdpMLineIndex() {
        return this.sdpMLineIndex;
    }

    get sdpMid() {
        return this.sdpMid;
    }

    get tcpType() {
        return this.tcpType;
    }

    get type() {
        return this.type || null;
    }

    get usernameFragment() {
        return this.usernameFragment;
    }

    toJSON() {
        return {
            candidate: this.candidate,
            sdpMLineIndex: this.sdpMLineIndex,
            sdpMid: this.sdpMid,
            usernameFragment: this.usernameFragment,
        };
    }
}
