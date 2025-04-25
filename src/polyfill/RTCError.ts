const RTCErrorDetailType = [
    'data-channel-failure',
    'dtls-failure',
    'fingerprint-failure',
    'sctp-failure',
    'sdp-syntax-error',
    'hardware-encoder-not-available',
    'hardware-encoder-error'
]

export default class RTCError extends DOMException implements globalThis.RTCError {
    #errorDetail: globalThis.RTCErrorDetailType;
    #receivedAlert: number | null;
    #sctpCauseCode: number | null;
    #sdpLineNumber: number | null;
    #sentAlert: number | null;
    #httpRequestStatusCode: number | null;

    constructor(init: globalThis.RTCErrorInit, message?: string) {
        if (arguments.length === 0) throw new TypeError("Failed to construct 'RTCError': 1 argument required, but only 0 present.")
        if (!init.errorDetail) throw new TypeError("Failed to construct 'RTCError': Failed to read the 'errorDetail' property from 'RTCErrorInit': Required member is undefined.")
        if (!RTCErrorDetailType.includes(init.errorDetail)) throw new TypeError(`Failed to construct 'RTCError': Failed to read the 'errorDetail' property from 'RTCErrorInit': The provided value '${init.errorDetail}' is not a valid enum value of type RTCErrorDetailType.`)
        super(message, 'OperationError')

        this.#errorDetail = init.errorDetail;
        this.#receivedAlert = init.receivedAlert ?? null;
        this.#sctpCauseCode = init.sctpCauseCode ?? null;
        this.#sdpLineNumber = init.sdpLineNumber ?? null;
        this.#sentAlert = init.sentAlert ?? null;
        this.#httpRequestStatusCode = init.httpRequestStatusCode ?? null
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

    get httpRequestStatusCode (): number | null {
        return this.#httpRequestStatusCode ?? null
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
