import NodeDataChannel from '../lib/index.js';
import RTCSessionDescription from './RTCSessionDescription.js';
import RTCDataChannel from './RTCDataChannel.js';
import RTCIceCandidate from './RTCIceCandidate.js';
import { RTCDataChannelEvent, RTCPeerConnectionIceEvent } from './Events.js';
import DOMException from './DOMException.js';

export default class _RTCPeerConnection extends EventTarget {
    #peerConnection;
    #localOffer;
    #localAnswer;
    #dataChannels;
    #config;
    #canTrickleIceCandidates;
    #sctp;

    // needs to be called with .bind(this)
    onconnectionstatechange = createEmptyFunction();
    ondatachannel = createEmptyFunction();
    onicecandidate = createEmptyFunction();
    onicecandidateerror = createEmptyFunction();
    oniceconnectionstatechange = createEmptyFunction();
    onicegatheringstatechange = createEmptyFunction();
    onnegotiationneeded = createEmptyFunction();
    onsignalingstatechange = createEmptyFunction();
    ontrack = createEmptyFunction();

    constructor(init = {}) {
        super();

        this.#config = init;
        this.#localOffer = createDeferredPromise();
        this.#localAnswer = createDeferredPromise();
        this.#dataChannels = new Set();
        this.#canTrickleIceCandidates = null;
        this.#sctp = null;

        const iceServers = init?.iceServers ?? [];

        this.#peerConnection = new NodeDataChannel.PeerConnection(init?.peerIdentity || `peer-${getRandomString(7)}`, {
            iceServers: iceServers
                .map((server) => {
                    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];

                    return urls.map((url) => {
                        if (server.username && server.credential) {
                            const [protocol, rest] = url.split(/:(.*)/);
                            return `${protocol}:${server.username}:${server.credential}@${rest}`;
                        }
                        return url;
                    });
                })
                .flat(),
            iceTransportPolicy: init?.iceTransportPolicy,
        });

        // forward peerConnection events
        this.#peerConnection.onStateChange(() => {
            this.dispatchEvent(new Event('connectionstatechange'));
        });

        this.#peerConnection.onIceStateChange(() => {
            this.dispatchEvent(new Event('iceconnectionstatechange'));
        });

        this.#peerConnection.onSignalingStateChange(() => {
            this.dispatchEvent(new Event('signalingstatechange'));
        });

        this.#peerConnection.onGatheringStateChange(() => {
            this.dispatchEvent(new Event('icegatheringstatechange'));
        });

        this.#peerConnection.onDataChannel((channel) => {
            const dataChannel = new RTCDataChannel(channel);
            this.#dataChannels.add(dataChannel);
            this.dispatchEvent(new RTCDataChannelEvent(dataChannel));
        });

        this.#peerConnection.onLocalDescription((sdp, type) => {
            if (type === 'offer') {
                this.#localOffer.resolve({ sdp, type });
            }

            if (type === 'answer') {
                this.#localAnswer.resolve({ sdp, type });
            }
        });

        this.#peerConnection.onLocalCandidate((candidate, sdpMid) => {
            if (sdpMid === 'unspec') {
                this.#localAnswer.reject(new Error(`Invalid description type ${sdpMid}`));
                return;
            }

            const event = new RTCPeerConnectionIceEvent(new RTCIceCandidate({ candidate, sdpMid }));
            this.onicecandidate(event);
        });

        // forward events to properties
        this.addEventListener('connectionstatechange', () => {
            this.onconnectionstatechange();
        });
        this.addEventListener('signalingstatechange', () => {
            this.onsignalingstatechange();
        });
        this.addEventListener('iceconnectionstatechange', () => {
            this.oniceconnectionstatechange();
        });
        this.addEventListener('icegatheringstatechange', () => {
            this.onicegatheringstatechange();
        });
        this.addEventListener('datachannel', (dc) => {
            this.ondatachannel(dc);
        });
    }

    get canTrickleIceCandidates() {
        return this.#canTrickleIceCandidates;
    }

    get connectionState() {
        return this.#peerConnection.state();
    }

    get iceConnectionState() {
        return this.#peerConnection.iceState();
    }

    get iceGatheringState() {
        return this.#peerConnection.gatheringState();
    }

    get currentLocalDescription() {
        return new RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get currentRemoteDescription() {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get localDescription() {
        return new RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get pendingLocalDescription() {
        return new RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get pendingRemoteDescription() {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get remoteDescription() {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get sctp() {
        return this.#sctp;
    }

    get signalingState() {
        return this.#peerConnection.signalingState();
    }

    static generateCertificate(keygenAlgorithm) {
        throw new DOMException('Not implemented');
    }

    async addIceCandidate(candidate) {
        if (candidate == null || candidate.candidate == null) {
            throw new DOMException('Candidate invalid');
        }

        this.#peerConnection.addRemoteCandidate(candidate.candidate, candidate.sdpMid ?? '0');
    }

    addTrack(track, ...streams) {
        throw new DOMException('Not implemented');
    }

    addTransceiver(trackOrKind, init) {
        throw new DOMException('Not implemented');
    }

    close() {
        // close all channels before shutting down
        this.#dataChannels.forEach((channel) => {
            channel.close();
        });

        this.#peerConnection.close();
    }

    createAnswer() {
        return this.#localAnswer;
    }

    createDataChannel(label, opts = {}) {
        const channel = this.#peerConnection.createDataChannel(label, opts);
        const dataChannel = new RTCDataChannel(channel, opts);

        // ensure we can close all channels when shutting down
        this.#dataChannels.add(dataChannel);
        dataChannel.addEventListener('close', () => {
            this.#dataChannels.delete(dataChannel);
        });

        return dataChannel;
    }

    createOffer() {
        return this.#localOffer;
    }

    getConfiguration() {
        return this.#config;
    }

    getReceivers() {
        throw new DOMException('Not implemented');
    }

    getSenders() {
        throw new DOMException('Not implemented');
    }

    getStats() {
        return new Promise((resolve) => {
            let report = new Map();
            let cp = this.#peerConnection.getSelectedCandidatePair();
            let bytesSent = this.#peerConnection.bytesSent();
            let bytesReceived = this.#peerConnection.bytesReceived();
            let rtt = this.#peerConnection.rtt();

            let localIdRs = getRandomString(8);
            let localId = 'RTCIceCandidate_' + localIdRs;
            report.set(localId, {
                id: localId,
                type: 'localcandidate',
                timestamp: Date.now(),
                candidateType: cp.local.type,
                ip: cp.local.address,
                port: cp.local.port,
            });

            let remoteIdRs = getRandomString(8);
            let remoteId = 'RTCIceCandidate_' + remoteIdRs;
            report.set(remoteId, {
                id: remoteId,
                type: 'remotecandidate',
                timestamp: Date.now(),
                candidateType: cp.remote.type,
                ip: cp.remote.address,
                port: cp.remote.port,
            });

            let candidateId = 'RTCIceCandidatePair_' + localIdRs + '_' + remoteIdRs;
            report.set(candidateId, {
                id: candidateId,
                type: 'candidate-pair',
                timestamp: Date.now(),
                localCandidateId: localId,
                remoteCandidateId: remoteId,
                state: 'succeeded',
                nominated: true,
                writable: true,
                bytesSent: bytesSent,
                bytesReceived: bytesReceived,
                totalRoundTripTime: rtt,
                currentRoundTripTime: rtt,
            });

            let transportId = 'RTCTransport_0_1';
            report.set(transportId, {
                id: transportId,
                timestamp: Date.now(),
                type: 'transport',
                bytesSent: bytesSent,
                bytesReceived: bytesReceived,
                dtlsState: 'connected',
                selectedCandidatePairId: candidateId,
                selectedCandidatePairChanges: 1,
            });

            return resolve(report);
        });
    }

    getTransceivers() {
        return []; // throw new DOMException('Not implemented');
    }

    removeTrack() {
        throw new DOMException('Not implemented');
    }

    restartIce() {
        throw new DOMException('Not implemented');
    }

    setConfiguration(config) {
        this.#config = config;
    }

    async setLocalDescription(description) {
        if (description == null || description.type == null) {
            throw new DOMException('Local description type must be set');
        }

        if (description.type !== 'offer') {
            // any other type causes libdatachannel to throw
            return;
        }
        this.#peerConnection.setLocalDescription(description.type);
    }

    async setRemoteDescription(description) {
        if (description.sdp == null) {
            throw new DOMException('Remote SDP must be set');
        }

        this.#peerConnection.setRemoteDescription(description.sdp, description.type);
    }
}

function createDeferredPromise() {
    let resolve, reject;

    let promise = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });

    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
}

function createEmptyFunction() {
    return () => {
        /** */
    };
}

function getRandomString(length) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}
