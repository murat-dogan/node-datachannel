// @ts-check
import defer from 'p-defer';
import NDC from '../lib/index.js';
import RTCSessionDescription from './RTCSessionDescription.js';
import RTCDataChannel from './RTCDataChannel.js';
import RTCIceCandidate from './RTCIceCandidate.js';
import { DataChannelEvent, PeerConnectionIceEvent } from './Events.js';

const noop = (e) => e;

/**
 * @class
 * @implements {RTCPeerConnection}
 */
export default class extends EventTarget {
    #peerConnection;
    #localOffer;
    #localAnswer;
    #dataChannels;
    #config;
    /**
     * @param  {RTCConfiguration} init
     */
    constructor(init) {
        super();

        this.#config = init;
        this.#localOffer = defer();
        this.#localAnswer = defer();
        this.#dataChannels = new Set();

        const iceServers = init.iceServers ?? [];

        this.#peerConnection = new NDC.PeerConnection(`peer-${Math.random()}`, {
            iceServers: iceServers
                .map((server) => {
                    const urls = (Array.isArray(server.urls) ? server.urls : [server.urls]).map((str) => new URL(str));

                    return urls.map((url) => {
                        /** @type {import('../lib/index.js').IceServer} */
                        const iceServer = {
                            hostname: url.hostname,
                            port: parseInt(url.port, 10),
                            username: server.username,
                            password: server.credential,
                            // relayType - how to specify?
                        };

                        return iceServer;
                    });
                })
                .flat(),
            iceTransportPolicy: init?.iceTransportPolicy,
        });

        this.#peerConnection.onStateChange(() => {
            this.dispatchEvent(new Event('connectionstatechange'));
        });
        this.#peerConnection.onSignalingStateChange(() => {
            this.dispatchEvent(new Event('signalingstatechange'));
        });
        this.#peerConnection.onGatheringStateChange(() => {
            this.dispatchEvent(new Event('icegatheringstatechange'));
        });
        this.#peerConnection.onDataChannel((channel) => {
            this.dispatchEvent(new DataChannelEvent(new RTCDataChannel(channel)));
        });

        // forward events to properties
        this.addEventListener('connectionstatechange', this.onconnectionstatechange);
        this.addEventListener('signalingstatechange', this.onsignalingstatechange);
        this.addEventListener('icegatheringstatechange', this.onicegatheringstatechange);
        this.addEventListener('datachannel', this.ondatachannel);

        this.#peerConnection.onLocalDescription((sdp, type) => {
            if (type === 'offer') {
                this.#localOffer.resolve({ sdp, type });
            }

            if (type === 'answer') {
                this.#localAnswer.resolve({ sdp, type });
            }
        });

        this.#peerConnection.onLocalCandidate((candidate, mid) => {
            if (mid === 'unspec') {
                this.#localAnswer.reject(new Error(`Invalid description type ${mid}`));
                return;
            }

            const event = new PeerConnectionIceEvent(new RTCIceCandidate({ candidate }));

            this.onicecandidate(event);
        });
    }

    #canTrickleIceCandidates = null;
    get canTrickleIceCandidates() {
        return this.#canTrickleIceCandidates;
    }

    get connectionState() {
        return this.#peerConnection.state();
    }

    get currentLocalDescription() {
        return this.#peerConnection.localDescription();
    }

    get currentRemoteDescription() {
        // not exposed by node-datachannel
        return toSessionDescription(null);
    }

    get iceConnectionState() {
        return this.#peerConnection.state();
    }

    get iceGatheringState() {
        return this.#peerConnection.gatheringState();
    }

    get localDescription() {
        return this.#peerConnection.localDescription();
    }

    get pendingLocalDescription() {
        return this.#peerConnection.localDescription();
    }

    get pendingRemoteDescription() {
        // not exposed by node-datachannel
        return toSessionDescription(null);
    }

    get remoteDescription() {
        // not exposed by node-datachannel
        return toSessionDescription(null);
    }
    #sctp = null;
    get sctp() {
        return this.#sctp;
    }

    get signalingState() {
        return this.#peerConnection.signalingState();
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

    async addIceCandidate(candidate) {
        if (candidate == null || candidate.candidate == null) {
            throw new Error('Candidate invalid');
        }

        this.#peerConnection.addRemoteCandidate(candidate.candidate, candidate.sdpMid ?? '0');
    }
    addTrack(track, ...streams) {
        throw new Error('Not implemented');
    }
    addTransceiver(trackOrKind, init) {
        throw new Error('Not implemented');
    }
    close() {
        // close all channels before shutting down
        this.#dataChannels.forEach((channel) => {
            channel.close();
        });

        this.#peerConnection.close();
        this.#peerConnection.destroy();
    }
    createAnswer() {
        return this.#localAnswer.promise;
    }
    createDataChannel(label, opts) {
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
        return this.#localOffer.promise;
    }
    getConfiguration() {
        return this.#config;
    }
    getReceivers() {
        throw new Error('Not implemented');
    }
    getSenders() {
        throw new Error('Not implemented');
    }
    async getStats() {
        throw new Error('Not implemented');
    }
    getTransceivers() {
        throw new Error('Not implemented');
    }
    removeTrack() {
        throw new Error('Not implemented');
    }
    restartIce() {
        throw new Error('Not implemented');
    }
    setConfiguration(config) {
        this.#config = config;
    }
    async setLocalDescription(description) {
        if (description == null || description.type == null) {
            throw new Error('Local description type must be set');
        }

        if (description.type !== 'offer') {
            // any other type causes libdatachannel to throw
            return;
        }
        this.#peerConnection.setLocalDescription(description.type);
    }
    async setRemoteDescription(description) {
        if (description.sdp == null) {
            throw new Error('Remote SDP must be set');
        }

        this.#peerConnection.setRemoteDescription(description.sdp, description.type);
    }
}

function toSessionDescription(description) {
    if (description == null) {
        return null;
    }

    return new RTCSessionDescription({
        sdp: description.sdp,
        type: description.type,
    });
}
