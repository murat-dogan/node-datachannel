import * as stream from 'stream';

export as namespace NodeDataChannel;

// Enum in d.ts is tricky
export type LogLevel = 'Verbose' | 'Debug' | 'Info' | 'Warning' | 'Error' | 'Fatal';

// SCTP Settings
export interface SctpSettings {
    recvBufferSize?: number;
    sendBufferSize?: number;
    maxChunksOnQueue?: number;
    initialCongestionWindow?: number;
    congestionControlModule?: number;
    delayedSackTime?: number;
}

// Functions
export function preload(): void;
export function initLogger(level: LogLevel, callback?: (level: LogLevel, message: string) => void): void;
export function cleanup(): void;
export function setSctpSettings(settings: SctpSettings): void;

// Proxy Server
export type ProxyServerType = 'Socks5' | 'Http';
export interface ProxyServer {
    type: ProxyServerType;
    ip: string;
    port: number;
    username?: string;
    password?: string;
}

export const enum RelayType {
    TurnUdp = 'TurnUdp',
    TurnTcp = 'TurnTcp',
    TurnTls = 'TurnTls',
}

export interface IceServer {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
    relayType?: RelayType;
}

export type TransportPolicy = 'all' | 'relay';

export interface RtcConfig {
    iceServers: (string | IceServer)[];
    proxyServer?: ProxyServer;
    bindAddress?: string;
    enableIceTcp?: boolean;
    enableIceUdpMux?: boolean;
    disableAutoNegotiation?: boolean;
    forceMediaTransport?: boolean;
    portRangeBegin?: number;
    portRangeEnd?: number;
    maxMessageSize?: number;
    mtu?: number;
    iceTransportPolicy?: TransportPolicy;
}

// Lowercase to match the description type string from libdatachannel
export const enum DescriptionType {
    Unspec = 'unspec',
    Offer = 'offer',
    Answer = 'answer',
    Pranswer = 'pranswer',
    Rollback = 'rollback',
}

export const enum ReliabilityType {
    Reliable = 0,
    Rexmit = 1,
    Timed = 2,
}

export interface DataChannelInitConfig {
    protocol?: string;
    negotiated?: boolean;
    id?: number;
    ordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;

    // Deprecated, use ordered, maxPacketLifeTime, and maxRetransmits
    reliability?: {
        type?: ReliabilityType;
        unordered?: boolean;
        rexmit?: number;
    };
}

export interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
}

// Must be same as rtc enum class Direction
export const enum Direction {
    SendOnly = 'SendOnly',
    RecvOnly = 'RecvOnly',
    SendRecv = 'SendRecv',
    Inactive = 'Inactive',
    Unknown = 'Unknown',
}

export class RtcpReceivingSession {
    requestBitrate(bitRate: number): void;
    requestKeyframe(): boolean;
}

export class Audio {
    constructor(mid: string, dir: Direction);
    addAudioCodec(payloadType: number, codec: string, profile?: string): void;
    addOpusCodec(payloadType: number, profile?: string): string;

    direction(): Direction;
    generateSdp(eol: string, addr: string, port: number): string;
    mid(): string;
    setDirection(dir: Direction): void;
    description(): string;
    removeFormat(fmt: string): void;
    addSSRC(ssrc: number, name?: string, msid?: string, trackID?: string): void;
    removeSSRC(ssrc: number): void;
    replaceSSRC(oldSsrc: number, ssrc: number, name?: string, msid?: string, trackID?: string): void;
    hasSSRC(ssrc: number): boolean;
    getSSRCs(): number[];
    getCNameForSsrc(ssrc: number): string;
    setBitrate(bitRate: number): void;
    getBitrate(): number;
    hasPayloadType(payloadType: number): boolean;
    addRTXCodec(payloadType: number, originalPayloadType: number, clockRate: number): void;
    addRTPMap(): void;
    parseSdpLine(line: string): void;
}

export class Video {
    constructor(mid: string, dir: Direction);
    addVideoCodec(payloadType: number, codec: string, profile?: string): void;
    addH264Codec(payloadType: number, profile?: string): void;
    addVP8Codec(payloadType: number): void;
    addVP9Codec(payloadType: number): void;

    direction(): Direction;
    generateSdp(eol: string, addr: string, port: number): string;
    mid(): string;
    setDirection(dir: Direction): void;
    description(): string;
    removeFormat(fmt: string): void;
    addSSRC(ssrc: number, name?: string, msid?: string, trackID?: string): void;
    removeSSRC(ssrc: number): void;
    replaceSSRC(oldSsrc: number, ssrc: number, name?: string, msid?: string, trackID?: string): void;
    hasSSRC(ssrc: number): boolean;
    getSSRCs(): number[];
    getCNameForSsrc(ssrc: number): string;
    setBitrate(bitRate: number): void;
    getBitrate(): number;
    hasPayloadType(payloadType: number): boolean;
    addRTXCodec(payloadType: number, originalPayloadType: number, clockRate: number): void;
    addRTPMap(): void;
    parseSdpLine(line: string): void;
}

export class Track {
    direction(): Direction;
    mid(): string;
    type(): string;
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Buffer): boolean;
    isOpen(): boolean;
    isClosed(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    requestKeyframe(): boolean;
    setMediaHandler(handler: RtcpReceivingSession): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onMessage(cb: (msg: Buffer) => void): void;
}

export class DataChannel {
    close(): void;
    getLabel(): string;
    getId(): number;
    getProtocol(): string;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Buffer): boolean;
    isOpen(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onBufferedAmountLow(cb: () => void): void;
    onMessage(cb: (msg: string | Buffer) => void): void;
}

export class PeerConnection {
    constructor(peerName: string, config: RtcConfig);
    close(): void;
    destroy(): void;
    setLocalDescription(type?: DescriptionType): void;
    setRemoteDescription(sdp: string, type: DescriptionType): void;
    localDescription(): { type: string; sdp: string } | null;
    remoteDescription(): { type: string; sdp: string } | null;
    addRemoteCandidate(candidate: string, mid: string): void;
    createDataChannel(label: string, config?: DataChannelInitConfig): DataChannel;
    addTrack(media: Video | Audio): Track;
    hasMedia(): boolean;
    state(): string;
    signalingState(): string;
    gatheringState(): string;
    onLocalDescription(cb: (sdp: string, type: DescriptionType) => void): void;
    onLocalCandidate(cb: (candidate: string, mid: string) => void): void;
    onStateChange(cb: (state: string) => void): void;
    onSignalingStateChange(cb: (state: string) => void): void;
    onGatheringStateChange(cb: (state: string) => void): void;
    onDataChannel(cb: (dc: DataChannel) => void): void;
    onTrack(cb: (track: Track) => void): void;
    bytesSent(): number;
    bytesReceived(): number;
    rtt(): number;
    getSelectedCandidatePair(): { local: SelectedCandidateInfo; remote: SelectedCandidateInfo } | null;
}

export class DataChannelStream extends stream.Duplex {
    constructor(rawChannel: DataChannel, options?: Omit<stream.DuplexOptions, 'objectMode'>);
    get label(): string;
}

type BinaryType = 'arraybuffer' | 'blob';

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

interface RTCDataChannelEventMap {
    bufferedamountlow: Event;
    close: Event;
    closing: Event;
    error: Event;
    message: MessageEvent;
    open: Event;
}

interface RTCDataChannel extends EventTarget {
    binaryType: BinaryType;
    readonly bufferedAmount: number;
    bufferedAmountLowThreshold: number;
    readonly id: number | null;
    readonly label: string;
    readonly maxPacketLifeTime: number | null;
    readonly maxRetransmits: number | null;
    readonly negotiated: boolean;
    onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclose: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclosing: ((this: RTCDataChannel, ev: Event) => any) | null;
    onerror: ((this: RTCDataChannel, ev: Event) => any) | null;
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null;
    onopen: ((this: RTCDataChannel, ev: Event) => any) | null;
    readonly ordered: boolean;
    readonly protocol: string;
    readonly readyState: RTCDataChannelState;
    close(): void;
    send(data: string): void;
    send(data: Blob): void;
    send(data: ArrayBuffer): void;
    send(data: ArrayBufferView): void;
    addEventListener<K extends keyof RTCDataChannelEventMap>(
        type: K,
        listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof RTCDataChannelEventMap>(
        type: K,
        listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

declare const RTCDataChannel: {
    prototype: RTCDataChannel;
    new (): RTCDataChannel;
};

interface RTCDataChannelEvent extends Event {
    readonly channel: RTCDataChannel;
}

declare const RTCDataChannelEvent: {
    prototype: RTCDataChannelEvent;
    new (type: string, eventInitDict: RTCDataChannelEventInit): RTCDataChannelEvent;
};

/** The RTCIceCandidate interface—part of the WebRTC API—represents a candidate Internet Connectivity Establishment (ICE) configuration which may be used to establish an RTCPeerConnection. */
interface RTCIceCandidate {
    readonly address: string | null;
    readonly candidate: string;
    readonly component: RTCIceComponent | null;
    readonly foundation: string | null;
    readonly port: number | null;
    readonly priority: number | null;
    readonly protocol: RTCIceProtocol | null;
    readonly relatedAddress: string | null;
    readonly relatedPort: number | null;
    readonly sdpMLineIndex: number | null;
    readonly sdpMid: string | null;
    readonly tcpType: RTCIceTcpCandidateType | null;
    readonly type: RTCIceCandidateType | null;
    readonly usernameFragment: string | null;
    toJSON(): RTCIceCandidateInit;
}

interface RTCIceCandidateInit {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string | null;
}

type RTCIceCandidateType = 'host' | 'prflx' | 'relay' | 'srflx';
type RTCIceTcpCandidateType = 'active' | 'passive' | 'so';
type RTCIceProtocol = 'tcp' | 'udp';
type RTCIceComponent = 'rtcp' | 'rtp';

declare const RTCIceCandidate: {
    prototype: RTCIceCandidate;
    new (candidateInitDict?: RTCIceCandidateInit): RTCIceCandidate;
};

/** One end of a connection—or potential connection—and how it's configured. Each RTCSessionDescription consists of a description type indicating which part of the offer/answer negotiation process it describes and of the SDP descriptor of the session. */
interface RTCSessionDescription {
    readonly sdp: string;
    readonly type: RTCSdpType;
    toJSON(): any;
}

type RTCSdpType = 'answer' | 'offer' | 'pranswer' | 'rollback';

interface RTCSctpTransportEventMap {
    statechange: Event;
}

interface RTCSctpTransport extends EventTarget {
    readonly maxChannels: number | null;
    readonly maxMessageSize: number;
    onstatechange: ((this: RTCSctpTransport, ev: Event) => any) | null;
    readonly state: RTCSctpTransportState;
    readonly transport: RTCDtlsTransport;
    addEventListener<K extends keyof RTCSctpTransportEventMap>(
        type: K,
        listener: (this: RTCSctpTransport, ev: RTCSctpTransportEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof RTCSctpTransportEventMap>(
        type: K,
        listener: (this: RTCSctpTransport, ev: RTCSctpTransportEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

declare const RTCSctpTransport: {
    prototype: RTCSctpTransport;
    new (): RTCSctpTransport;
};

type RTCSctpTransportState = 'closed' | 'connected' | 'connecting';

interface RTCDtlsTransportEventMap {
    error: Event;
    statechange: Event;
}

interface RTCDtlsTransport extends EventTarget {
    readonly iceTransport: RTCIceTransport;
    onerror: ((this: RTCDtlsTransport, ev: Event) => any) | null;
    onstatechange: ((this: RTCDtlsTransport, ev: Event) => any) | null;
    readonly state: RTCDtlsTransportState;
    getRemoteCertificates(): ArrayBuffer[];
    addEventListener<K extends keyof RTCDtlsTransportEventMap>(
        type: K,
        listener: (this: RTCDtlsTransport, ev: RTCDtlsTransportEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof RTCDtlsTransportEventMap>(
        type: K,
        listener: (this: RTCDtlsTransport, ev: RTCDtlsTransportEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

type RTCDtlsTransportState = 'closed' | 'connected' | 'connecting' | 'failed' | 'new';

declare const RTCDtlsTransport: {
    prototype: RTCDtlsTransport;
    new (): RTCDtlsTransport;
};

interface RTCIceTransportEventMap {
    gatheringstatechange: Event;
    statechange: Event;
}

/** Provides access to information about the ICE transport layer over which the data is being sent and received. */
interface RTCIceTransport extends EventTarget {
    readonly gatheringState: RTCIceGathererState;
    readonly component: RTCIceComponent;
    readonly role: RTCIceRole;
    ongatheringstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    readonly state: RTCIceTransportState;
    addEventListener<K extends keyof RTCIceTransportEventMap>(
        type: K,
        listener: (this: RTCIceTransport, ev: RTCIceTransportEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof RTCIceTransportEventMap>(
        type: K,
        listener: (this: RTCIceTransport, ev: RTCIceTransportEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

declare const RTCIceTransport: {
    prototype: RTCIceTransport;
    new (): RTCIceTransport;
};

type RTCIceComponent = 'RTP' | 'RTSP';
type RTCIceRole = 'controlling' | 'controlled';

type RTCIceTransportPolicy = 'all' | 'relay';
type RTCIceTransportState = 'checking' | 'closed' | 'completed' | 'connected' | 'disconnected' | 'failed' | 'new';

type RTCIceGathererState = 'complete' | 'gathering' | 'new';

interface RTCCertificate {
    readonly expires: EpochTimeStamp;
    getFingerprints(): RTCDtlsFingerprint[];
}

declare const RTCCertificate: {
    prototype: RTCCertificate;
    new (): RTCCertificate;
};

interface RTCDtlsFingerprint {
    algorithm?: string;
    value?: string;
}

type EpochTimeStamp = number;

interface RTCPeerConnectionEventMap {
    connectionstatechange: Event;
    datachannel: RTCDataChannelEvent;
    icecandidate: RTCPeerConnectionIceEvent;
    icecandidateerror: Event;
    iceconnectionstatechange: Event;
    icegatheringstatechange: Event;
    negotiationneeded: Event;
    signalingstatechange: Event;
    track: RTCTrackEvent;
}

/** A WebRTC connection between the local computer and a remote peer. It provides methods to connect to a remote peer, maintain and monitor the connection, and close the connection once it's no longer needed. */
interface RTCPeerConnection extends EventTarget {
    readonly canTrickleIceCandidates: boolean | null;
    readonly connectionState: RTCPeerConnectionState;
    readonly currentLocalDescription: RTCSessionDescription | null;
    readonly currentRemoteDescription: RTCSessionDescription | null;
    readonly iceConnectionState: RTCIceConnectionState;
    readonly iceGatheringState: RTCIceGatheringState;
    readonly localDescription: RTCSessionDescription | null;
    onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    ondatachannel: ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => any) | null;
    onicecandidate: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null;
    onicecandidateerror: ((this: RTCPeerConnection, ev: Event) => any) | null;
    oniceconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onicegatheringstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onsignalingstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
    readonly pendingLocalDescription: RTCSessionDescription | null;
    readonly pendingRemoteDescription: RTCSessionDescription | null;
    readonly remoteDescription: RTCSessionDescription | null;
    readonly sctp: RTCSctpTransport | null;
    readonly signalingState: RTCSignalingState;
    addIceCandidate(candidate?: RTCIceCandidateInit): Promise<void>;
    addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
    addTransceiver(trackOrKind: MediaStreamTrack | string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver;
    close(): void;
    createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit): RTCDataChannel;
    createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
    getConfiguration(): RTCConfiguration;
    getReceivers(): RTCRtpReceiver[];
    getSenders(): RTCRtpSender[];
    getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport>;
    getTransceivers(): RTCRtpTransceiver[];
    removeTrack(sender: RTCRtpSender): void;
    restartIce(): void;
    setConfiguration(configuration?: RTCConfiguration): void;
    setLocalDescription(description?: RTCLocalSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addEventListener<K extends keyof RTCPeerConnectionEventMap>(
        type: K,
        listener: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof RTCPeerConnectionEventMap>(
        type: K,
        listener: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

declare const RTCPeerConnection: {
    prototype: RTCPeerConnection;
    new (configuration?: RTCConfiguration): RTCPeerConnection;
    generateCertificate(keygenAlgorithm: AlgorithmIdentifier): Promise<RTCCertificate>;
};

interface RTCPeerConnectionIceErrorEvent extends Event {
    readonly address: string | null;
    readonly errorCode: number;
    readonly errorText: string;
    readonly port: number | null;
    readonly url: string;
}

declare const RTCPeerConnectionIceErrorEvent: {
    prototype: RTCPeerConnectionIceErrorEvent;
    new (type: string, eventInitDict: RTCPeerConnectionIceErrorEventInit): RTCPeerConnectionIceErrorEvent;
};

/** Events that occurs in relation to ICE candidates with the target, usually an RTCPeerConnection. Only one event is of this type: icecandidate. */
interface RTCPeerConnectionIceEvent extends Event {
    readonly candidate: RTCIceCandidate | null;
}

declare const RTCPeerConnectionIceEvent: {
    prototype: RTCPeerConnectionIceEvent;
    new (type: string, eventInitDict?: RTCPeerConnectionIceEventInit): RTCPeerConnectionIceEvent;
};

interface RTCConfiguration {
    bundlePolicy?: RTCBundlePolicy;
    certificates?: RTCCertificate[];
    iceCandidatePoolSize?: number;
    iceServers?: RTCIceServer[];
    iceTransportPolicy?: RTCIceTransportPolicy;
    rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

type RTCPeerConnectionState = 'closed' | 'connected' | 'connecting' | 'disconnected' | 'failed' | 'new';

type RTCIceConnectionState = 'checking' | 'closed' | 'completed' | 'connected' | 'disconnected' | 'failed' | 'new';

type RTCIceGatheringState = 'complete' | 'gathering' | 'new';

type RTCSignalingState =
    | 'closed'
    | 'have-local-offer'
    | 'have-local-pranswer'
    | 'have-remote-offer'
    | 'have-remote-pranswer'
    | 'stable';

interface RTCSessionDescriptionInit {
    sdp?: string;
    type: RTCSdpType;
}

interface RTCLocalSessionDescriptionInit {
    sdp?: string;
    type?: RTCSdpType;
}
