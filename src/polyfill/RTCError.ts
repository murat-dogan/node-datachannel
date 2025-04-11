export default class RTCError extends DOMException implements globalThis.RTCError {
    #errorDetail: globalThis.RTCErrorDetailType;
    #receivedAlert: number | null;
    #sctpCauseCode: number | null;
    #sdpLineNumber: number | null;
    #sentAlert: number | null;

    constructor(init: globalThis.RTCErrorInit, message?: string) {
        super(message, 'OperationError');

        if (!init || !init.errorDetail) throw new TypeError('Cannot construct RTCError, errorDetail is required');
        if (
            [
                'data-channel-failure',
                'dtls-failure',
                'fingerprint-failure',
                'hardware-encoder-error',
                'hardware-encoder-not-available',
                'sctp-failure',
                'sdp-syntax-error',
            ].indexOf(init.errorDetail) === -1
        )
            throw new TypeError('Cannot construct RTCError, errorDetail is invalid');

        this.#errorDetail = init.errorDetail;
        this.#receivedAlert = init.receivedAlert ?? null;
        this.#sctpCauseCode = init.sctpCauseCode ?? null;
        this.#sdpLineNumber = init.sdpLineNumber ?? null;
        this.#sentAlert = init.sentAlert ?? null;
    }

    get errorDetail(): globalThis.RTCErrorDetailType {
        return this.#errorDetail;
    }

    set errorDetail(_value) {
        throw new TypeError('Cannot set errorDetail, it is read-only');
    }

    get receivedAlert(): number | null {
        return this.#receivedAlert;
    }

    set receivedAlert(_value) {
        throw new TypeError('Cannot set receivedAlert, it is read-only');
    }

    get sctpCauseCode(): number | null {
        return this.#sctpCauseCode;
    }

    set sctpCauseCode(_value) {
        throw new TypeError('Cannot set sctpCauseCode, it is read-only');
    }

    get sdpLineNumber(): number | null {
        return this.#sdpLineNumber;
    }

    set sdpLineNumber(_value) {
        throw new TypeError('Cannot set sdpLineNumber, it is read-only');
    }

    get sentAlert(): number | null {
        return this.#sentAlert;
    }

    set sentAlert(_value) {
        throw new TypeError('Cannot set sentAlert, it is read-only');
    }
}
