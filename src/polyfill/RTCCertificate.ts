export default class RTCCertificate implements globalThis.RTCCertificate {
    #expires: number;
    #fingerprints: globalThis.RTCDtlsFingerprint[];

    constructor() {
        this.#expires = null;
        this.#fingerprints = [];
    }

    get expires(): number {
        return this.#expires;
    }

    getFingerprints(): globalThis.RTCDtlsFingerprint[] {
        return this.#fingerprints;
    }
}
