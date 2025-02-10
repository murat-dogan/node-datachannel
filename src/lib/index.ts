import nodeDataChannel from './node-datachannel';
import _DataChannelStream from './datachannel-stream';
import { WebSocketServer } from './websocket-server';
import { Channel, DataChannelInitConfig, DescriptionType, Direction, LogLevel, RtcConfig, RTCIceConnectionState, RTCIceGatheringState, RTCPeerConnectionState, RTCSignalingState, SctpSettings, SelectedCandidateInfo } from './types';
import { WebSocket } from './websocket';

export function preload(): void { nodeDataChannel.preload(); }
export function initLogger(level: LogLevel): void { nodeDataChannel.initLogger(level); }
export function cleanup(): void { nodeDataChannel.cleanup(); }
export function setSctpSettings(settings: SctpSettings): void { nodeDataChannel.setSctpSettings(settings); }
export function getLibraryVersion(): string { return nodeDataChannel.getLibraryVersion(); }

export interface Audio {
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
export const Audio: {
    new(mid: string, dir: Direction): Audio
} = nodeDataChannel.Audio


export interface Video {
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
export const Video: {
    new(mid: string, dir: Direction): Video
} = nodeDataChannel.Video

export interface Track {
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
    requestBitrate(bitRate: number): boolean;
    setBufferedAmountLowThreshold(newSize: number): void;
    requestKeyframe(): boolean;
    setMediaHandler(handler: RtcpReceivingSession): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onMessage(cb: (msg: Buffer) => void): void;
}
export const Track: {
    new(): Track
} = nodeDataChannel.Track

export interface DataChannel extends Channel {
    getLabel(): string;
    getId(): number;
    getProtocol(): string;

    // Channel implementation
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Buffer | Uint8Array): boolean;
    isOpen(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onBufferedAmountLow(cb: () => void): void;
    onMessage(cb: (msg: string | Buffer | ArrayBuffer) => void): void;
}
export const DataChannel: {
    // DataChannel implementation
} = nodeDataChannel.DataChannel

export interface PeerConnection {
    close(): void;
    setLocalDescription(type?: DescriptionType): void;
    setRemoteDescription(sdp: string, type: DescriptionType): void;
    localDescription(): { type: DescriptionType; sdp: string } | null;
    remoteDescription(): { type: DescriptionType; sdp: string } | null;
    addRemoteCandidate(candidate: string, mid: string): void;
    createDataChannel(label: string, config?: DataChannelInitConfig): DataChannel;
    addTrack(media: Video | Audio): Track;
    hasMedia(): boolean;
    state(): RTCPeerConnectionState;
    iceState(): RTCIceConnectionState;
    signalingState(): RTCSignalingState;
    gatheringState(): RTCIceGatheringState;
    onLocalDescription(cb: (sdp: string, type: DescriptionType) => void): void;
    onLocalCandidate(cb: (candidate: string, mid: string) => void): void;
    onStateChange(cb: (state: string) => void): void;
    onIceStateChange(cb: (state: string) => void): void;
    onSignalingStateChange(cb: (state: string) => void): void;
    onGatheringStateChange(cb: (state: string) => void): void;
    onDataChannel(cb: (dc: DataChannel) => void): void;
    onTrack(cb: (track: Track) => void): void;
    bytesSent(): number;
    bytesReceived(): number;
    rtt(): number;
    getSelectedCandidatePair(): { local: SelectedCandidateInfo; remote: SelectedCandidateInfo } | null;
    maxDataChannelId(): number;
    maxMessageSize(): number;
}
export const PeerConnection: {
    new(peerName: string, config: RtcConfig): PeerConnection
} = nodeDataChannel.PeerConnection

export class RtcpReceivingSession {
    //
}

export { WebSocketServer } from './websocket-server';
export { WebSocket } from './websocket';

export const DataChannelStream = _DataChannelStream;

export default {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    getLibraryVersion,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
    WebSocketServer,
    DataChannelStream
};


// Types
// https://github.com/murat-dogan/node-datachannel/issues/300
export *  from './types';
