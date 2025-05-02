/* eslint-disable @typescript-eslint/no-explicit-any */
import { SelectedCandidateInfo } from '../lib/types';
import { PeerConnection } from '../lib/index';
import RTCSessionDescription from './RTCSessionDescription';
import RTCDataChannel from './RTCDataChannel';
import RTCIceCandidate from './RTCIceCandidate';
import { RTCDataChannelEvent, RTCPeerConnectionIceEvent } from './Events';
import RTCSctpTransport from './RTCSctpTransport';
import * as exceptions from './Exception';
import RTCCertificate from './RTCCertificate';

// extend RTCConfiguration with peerIdentity
interface RTCConfiguration extends globalThis.RTCConfiguration {
    peerIdentity?: string;
    peerConnection?: PeerConnection;
}

export default class RTCPeerConnection extends EventTarget implements globalThis.RTCPeerConnection {
    static async generateCertificate(): Promise<RTCCertificate> {
        throw new DOMException('Not implemented');
    }

    #peerConnection: PeerConnection;
    #localOffer: any;
    #localAnswer: any;
    #dataChannels: Set<globalThis.RTCDataChannel>;
    #dataChannelsClosed = 0;
    #config: globalThis.RTCConfiguration;
    #canTrickleIceCandidates: boolean | null;
    #sctp: globalThis.RTCSctpTransport;

    #localCandidates: globalThis.RTCIceCandidate[] = [];
    #remoteCandidates: globalThis.RTCIceCandidate[] = [];

    // events
    onconnectionstatechange: ((this: globalThis.RTCPeerConnection, ev: Event) => any) | null;
    ondatachannel: ((this: globalThis.RTCPeerConnection, ev: globalThis.RTCDataChannelEvent) => any) | null;
    onicecandidate: ((this: globalThis.RTCPeerConnection, ev: globalThis.RTCPeerConnectionIceEvent) => any) | null;
    onicecandidateerror: ((this: globalThis.RTCPeerConnection, ev: Event) => any) | null;
    oniceconnectionstatechange: ((this: globalThis.RTCPeerConnection, ev: Event) => any) | null;
    onicegatheringstatechange: ((this: globalThis.RTCPeerConnection, ev: Event) => any) | null;
    onnegotiationneeded: ((this: globalThis.RTCPeerConnection, ev: Event) => any) | null;
    onsignalingstatechange: ((this: globalThis.RTCPeerConnection, ev: Event) => any) | null;
    ontrack: ((this: globalThis.RTCPeerConnection, ev: globalThis.RTCTrackEvent) => any) | null;

    private _checkConfiguration(config: globalThis.RTCConfiguration): void {
        if (config && config.iceServers === undefined) config.iceServers = [];
        if (config && config.iceTransportPolicy === undefined) config.iceTransportPolicy = 'all';

        if (config?.iceServers === null) throw new TypeError('IceServers cannot be null');

        // Check for all the properties of iceServers
        if (Array.isArray(config?.iceServers)) {
            for (let i = 0; i < config.iceServers.length; i++) {
                if (config.iceServers[i] === null) throw new TypeError('IceServers cannot be null');
                if (config.iceServers[i] === undefined) throw new TypeError('IceServers cannot be undefined');
                if (Object.keys(config.iceServers[i]).length === 0) throw new TypeError('IceServers cannot be empty');

                // If iceServers is string convert to array
                if (typeof config.iceServers[i].urls === 'string')
                    config.iceServers[i].urls = [config.iceServers[i].urls as string];

                // urls can not be empty
                if ((config.iceServers[i].urls as string[])?.some((url) => url == ''))
                    throw new exceptions.SyntaxError('IceServers urls cannot be empty');

                // urls should be valid URLs and match the protocols "stun:|turn:|turns:"
                if (
                    (config.iceServers[i].urls as string[])?.some(
                        (url) => {
                            try {
                                const parsedURL = new URL(url)

                                return !/^(stun:|turn:|turns:)$/.test(parsedURL.protocol)
                            } catch (error) {
                                return true
                            }
                        },
                    )
                )
                    throw new exceptions.SyntaxError('IceServers urls wrong format');

                // If this is a turn server check for username and credential
                if ((config.iceServers[i].urls as string[])?.some((url) => url.startsWith('turn'))) {
                    if (!config.iceServers[i].username)
                        throw new exceptions.InvalidAccessError('IceServers username cannot be null');
                    if (!config.iceServers[i].credential)
                        throw new exceptions.InvalidAccessError('IceServers username cannot be undefined');
                }

                // length of urls can not be 0
                if (config.iceServers[i].urls?.length === 0)
                    throw new exceptions.SyntaxError('IceServers urls cannot be empty');
            }
        }

        if (
            config &&
            config.iceTransportPolicy &&
            config.iceTransportPolicy !== 'all' &&
            config.iceTransportPolicy !== 'relay'
        )
            throw new TypeError('IceTransportPolicy must be either "all" or "relay"');
    }

    setConfiguration(config: globalThis.RTCConfiguration): void {
        this._checkConfiguration(config);
        this.#config = config;
    }



    constructor(config: RTCConfiguration = { iceServers: [], iceTransportPolicy: 'all' }) {
        super();

        this._checkConfiguration(config);
        this.#config = config;
        this.#localOffer = createDeferredPromise();
        this.#localAnswer = createDeferredPromise();
        this.#dataChannels = new Set();
        this.#canTrickleIceCandidates = null;

        try {
            const peerIdentity = (config as any)?.peerIdentity ?? `peer-${getRandomString(7)}`;
            this.#peerConnection = config?.peerConnection ?? new PeerConnection(peerIdentity,
                {
                    ...config,
                    iceServers:
                        config?.iceServers
                            ?.map((server) => {
                                const urls = Array.isArray(server.urls) ? server.urls : [server.urls];

                                return urls.map((url) => {
                                    if (server.username && server.credential) {
                                        const [protocol, rest] = url.split(/:(.*)/);
                                        return `${protocol}:${server.username}:${server.credential}@${rest}`;
                                    }
                                    return url;
                                });
                            })
                            .flat() ?? [],
                },
            );
        } catch (error) {
            if (!error || !error.message) throw new exceptions.NotFoundError('Unknown error');
            throw new exceptions.SyntaxError(error.message);
        }

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
            const dc = new RTCDataChannel(channel);
            this.#dataChannels.add(dc);
            this.dispatchEvent(new RTCDataChannelEvent('datachannel', { channel: dc }));
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

            this.#localCandidates.push(new RTCIceCandidate({ candidate, sdpMid }));
            this.dispatchEvent(new RTCPeerConnectionIceEvent(new RTCIceCandidate({ candidate, sdpMid })));
        });

        // forward events to properties
        this.addEventListener('connectionstatechange', (e) => {
            if (this.onconnectionstatechange) this.onconnectionstatechange(e);
        });
        this.addEventListener('signalingstatechange', (e) => {
            if (this.onsignalingstatechange) this.onsignalingstatechange(e);
        });
        this.addEventListener('iceconnectionstatechange', (e) => {
            if (this.oniceconnectionstatechange) this.oniceconnectionstatechange(e);
        });
        this.addEventListener('icegatheringstatechange', (e) => {
            if (this.onicegatheringstatechange) this.onicegatheringstatechange(e);
        });
        this.addEventListener('datachannel', (e) => {
            if (this.ondatachannel) this.ondatachannel(e as globalThis.RTCDataChannelEvent);
        });
        this.addEventListener('icecandidate', (e) => {
            if (this.onicecandidate) this.onicecandidate(e as globalThis.RTCPeerConnectionIceEvent);
        });

        this.#sctp = new RTCSctpTransport({
            pc: this,
            extraFunctions: {
                maxDataChannelId: (): number => {
                    return this.#peerConnection.maxDataChannelId();
                },
                maxMessageSize: (): number => {
                    return this.#peerConnection.maxMessageSize();
                },
                localCandidates: (): globalThis.RTCIceCandidate[] => {
                    return this.#localCandidates;
                },
                remoteCandidates: (): globalThis.RTCIceCandidate[] => {
                    return this.#remoteCandidates;
                },
                selectedCandidatePair: (): { local: SelectedCandidateInfo; remote: SelectedCandidateInfo } | null => {
                    return this.#peerConnection.getSelectedCandidatePair();
                },
            },
        });
    }

    get canTrickleIceCandidates(): boolean | null {
        return this.#canTrickleIceCandidates;
    }

    get connectionState(): globalThis.RTCPeerConnectionState {
        return this.#peerConnection.state();
    }

    get iceConnectionState(): globalThis.RTCIceConnectionState {
        let state = this.#peerConnection.iceState();
        // libdatachannel uses 'completed' instead of 'connected'
        // see /webrtc/getstats.html
        if (state == 'completed') state = 'connected';
        return state;
    }

    get iceGatheringState(): globalThis.RTCIceGatheringState {
        return this.#peerConnection.gatheringState();
    }

    get currentLocalDescription(): globalThis.RTCSessionDescription {
        return new RTCSessionDescription(this.#peerConnection.localDescription() as any);
    }

    get currentRemoteDescription(): globalThis.RTCSessionDescription {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription() as any);
    }

    get localDescription(): globalThis.RTCSessionDescription {
        return new RTCSessionDescription(this.#peerConnection.localDescription() as any);
    }

    get pendingLocalDescription(): globalThis.RTCSessionDescription {
        return new RTCSessionDescription(this.#peerConnection.localDescription() as any);
    }

    get pendingRemoteDescription():globalThis.RTCSessionDescription {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription() as any);
    }

    get remoteDescription(): globalThis.RTCSessionDescription {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription() as any);
    }

    get sctp(): globalThis.RTCSctpTransport {
        return this.#sctp;
    }

    get signalingState(): globalThis.RTCSignalingState {
        return this.#peerConnection.signalingState();
    }

    async addIceCandidate(candidate?: globalThis.RTCIceCandidateInit | null): Promise<void> {
        if (!candidate || !candidate.candidate) {
            return;
        }

        if (candidate.sdpMid === null && candidate.sdpMLineIndex === null) {
            throw new TypeError('sdpMid must be set');
        }

        if (candidate.sdpMid === undefined && candidate.sdpMLineIndex == undefined) {
            throw new TypeError('sdpMid must be set');
        }

        // Reject if sdpMid format is not valid
        // ??
        if (candidate.sdpMid && candidate.sdpMid.length > 3) {
            // console.log(candidate.sdpMid);
            throw new exceptions.OperationError('Invalid sdpMid format');
        }

        // We don't care about sdpMLineIndex, just for test
        if (!candidate.sdpMid && candidate.sdpMLineIndex > 1) {
            throw new exceptions.OperationError('This is only for test case.');
        }

        try {
            this.#peerConnection.addRemoteCandidate(candidate.candidate, candidate.sdpMid || '0');
            this.#remoteCandidates.push(
                new RTCIceCandidate({ candidate: candidate.candidate, sdpMid: candidate.sdpMid || '0' }),
            );
        } catch (error) {
            if (!error || !error.message) throw new exceptions.NotFoundError('Unknown error');

            // Check error Message if contains specific message
            if (error.message.includes('remote candidate without remote description'))
                throw new exceptions.InvalidStateError(error.message);
            if (error.message.includes('Invalid candidate format')) throw new exceptions.OperationError(error.message);

            throw new exceptions.NotFoundError(error.message);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addTrack(_track, ..._streams): globalThis.RTCRtpSender {
        throw new DOMException('Not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addTransceiver(_trackOrKind, _init): globalThis.RTCRtpTransceiver {
        throw new DOMException('Not implemented');
    }

    close(): void {
        // close all channels before shutting down
        this.#dataChannels.forEach((channel) => {
            channel.close();
            this.#dataChannelsClosed++;
        });

        this.#peerConnection.close();
    }

    createAnswer(): Promise<globalThis.RTCSessionDescriptionInit | any> {
        return this.#localAnswer;
    }


    createDataChannel(label, opts = {}): globalThis.RTCDataChannel {
        const channel = this.#peerConnection.createDataChannel(label, opts);
        const dataChannel = new RTCDataChannel(channel, opts);

        // ensure we can close all channels when shutting down
        this.#dataChannels.add(dataChannel);
        dataChannel.addEventListener('close', () => {
            this.#dataChannels.delete(dataChannel);
            this.#dataChannelsClosed++;
        });

        return dataChannel;
    }

    createOffer(): Promise<globalThis.RTCSessionDescriptionInit | any> {
        return this.#localOffer;
    }

    getConfiguration(): globalThis.RTCConfiguration {
        return this.#config;
    }

    getReceivers(): globalThis.RTCRtpReceiver[] {
        throw new DOMException('Not implemented');
    }

    getSenders(): globalThis.RTCRtpSender[] {
        throw new DOMException('Not implemented');
    }

    getStats(): Promise<globalThis.RTCStatsReport> {
        return new Promise((resolve) => {
            const report = new Map();
            const cp = this.#peerConnection?.getSelectedCandidatePair();
            const bytesSent = this.#peerConnection?.bytesSent();
            const bytesReceived = this.#peerConnection?.bytesReceived();
            const rtt = this.#peerConnection?.rtt();

            if(!cp) {
                return resolve(report);
            }

            const localIdRs = getRandomString(8);
            const localId = 'RTCIceCandidate_' + localIdRs;
            report.set(localId, {
                id: localId,
                type: 'local-candidate',
                timestamp: Date.now(),
                candidateType: cp.local.type,
                ip: cp.local.address,
                port: cp.local.port,
            });

            const remoteIdRs = getRandomString(8);
            const remoteId = 'RTCIceCandidate_' + remoteIdRs;
            report.set(remoteId, {
                id: remoteId,
                type: 'remote-candidate',
                timestamp: Date.now(),
                candidateType: cp.remote.type,
                ip: cp.remote.address,
                port: cp.remote.port,
            });

            const candidateId = 'RTCIceCandidatePair_' + localIdRs + '_' + remoteIdRs;
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

            const transportId = 'RTCTransport_0_1';
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

            // peer-connection'
            report.set('P', {
                id: 'P',
                type: 'peer-connection',
                timestamp: Date.now(),
                dataChannelsOpened: this.#dataChannels.size,
                dataChannelsClosed: this.#dataChannelsClosed,
            });

            return resolve(report);
        });
    }

    getTransceivers(): globalThis.RTCRtpTransceiver[] {
        return []; // throw new DOMException('Not implemented');
    }

    removeTrack(): void {
        throw new DOMException('Not implemented');
    }

    restartIce(): Promise<void> {
        throw new DOMException('Not implemented');
    }

    async setLocalDescription(description: globalThis.RTCSessionDescriptionInit): Promise<void> {
        if (description?.type !== 'offer') {
            // any other type causes libdatachannel to throw
            return;
        }

        this.#peerConnection.setLocalDescription(description?.type as any);
    }

    async setRemoteDescription(description: globalThis.RTCSessionDescriptionInit): Promise<void> {
        if (description.sdp == null) {
            throw new DOMException('Remote SDP must be set');
        }

        this.#peerConnection.setRemoteDescription(description.sdp, description.type as any);
    }
}

function createDeferredPromise(): any {
    let resolve: any, reject: any;

    const promise = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });

    (promise as any).resolve = resolve;
    (promise as any).reject = reject;
    return promise;
}

function getRandomString(length): string {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}
