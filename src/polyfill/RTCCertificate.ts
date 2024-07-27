export default class RTCCertificate {
    #expires: number;
    #fingerprints: RTCDtlsFingerprint[];

    constructor() {
        this.#expires = null;
        this.#fingerprints = [];
    }

    get expires(): number {
        return this.#expires;
    }

    getFingerprints(): RTCDtlsFingerprint[] {
        return this.#fingerprints;
    }
}
