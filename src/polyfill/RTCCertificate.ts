export default class RTCCertificate implements globalThis.RTCCertificate {
    #expires: number = 0;
    #fingerprints: globalThis.RTCDtlsFingerprint[] = [];

    get expires(): number {
        return this.#expires;
    }

    getFingerprints(): globalThis.RTCDtlsFingerprint[] {
        return this.#fingerprints;
    }

    getAlgorithm (): string {
        return ''
    }
}
