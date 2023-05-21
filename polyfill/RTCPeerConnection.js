// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export default class RTCPeerConnection {
    constructor() {}

    #canTrickleIceCandidates = null;
    get canTrickleIceCandidates() {
        return this.#canTrickleIceCandidates;
    }
    #connectionState = null;
    get connectionState() {
        return this.#connectionState;
    }
    #currentLocalDescription = null;
    get currentLocalDescription() {
        return this.#currentLocalDescription;
    }
    #currentRemoteDescription = null;
    get currentRemoteDescription() {
        return this.#currentRemoteDescription;
    }
    #iceConnectionState = null;
    get iceConnectionState() {
        return this.#iceConnectionState;
    }
    #iceGatheringState = null;
    get iceGatheringState() {
        return this.#iceGatheringState;
    }
    #localDescription = null;
    get localDescription() {
        return this.#localDescription;
    }
    #pendingLocalDescription = null;
    get pendingLocalDescription() {
        return this.#pendingLocalDescription;
    }
    #pendingRemoteDescription = null;
    get pendingRemoteDescription() {
        return this.#pendingRemoteDescription;
    }
    #remoteDescription = null;
    get remoteDescription() {
        return this.#remoteDescription;
    }
    #sctp = null;
    get sctp() {
        return this.#sctp;
    }
    #signalingState = null;
    get signalingState() {
        return this.#signalingState;
    }

    onconnectionstatechange = noop;
    ondatachannel = noop;
    onicecandidate = noop;
    onicecandidateerror = noop;
    oniceconnectionstatechange = noop;
    onicegatheringstatechange = noop;
    onnegotiationneeded = noop;
    onsignalingstatechange = noop;
    ontrack = noop;

    static generateCertificate() {}

    addIceCandidate() {}
    addTrack() {}
    addTransceiver() {}
    close() {}
    createAnswer() {}
    createDataChannel() {}
    createOffer() {}
    getConfiguration() {}
    getReceivers() {}
    getSenders() {}
    getStats() {}
    getTransceivers() {}
    removeTrack() {}
    restartIce() {}
    setConfiguration() {}
    setLocalDescription() {}
    setRemoteDescription() {}
}
