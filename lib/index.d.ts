export as namespace NodeDataChannel;

// Enum in d.ts is tricky
export type LogLevel = "Verbose" | "Debug" | "Info" | "Warning" | "Error" | "Fatal";

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
export function initLogger(level: LogLevel): void;
export function cleanup(): void;
export function setSctpSettings(settings: SctpSettings): void;

// Proxy Server
export type ProxyServerType = 'None' | 'Socks5' | 'Http';
export interface ProxyServer {
    type: ProxyServerType;
    ip: string;
    port: Number;
    username?: string;
    password?: string;
}

export const enum RelayType {
    TurnUdp = 'TurnUdp',
    TurnTcp = 'TurnTcp',
    TurnTls = 'TurnTls'
}

export interface IceServer {
    hostname: string;
    port: Number;
    username?: string;
    password?: string;
    relayType?: RelayType;
}

export type TransportPolicy = 'all' | 'relay';
export interface RtcConfig {
    iceServers: (string | IceServer)[];
    proxyServer?: ProxyServer;
    enableIceTcp?: boolean;
    portRangeBegin?: number;
    portRangeEnd?: number;
    maxMessageSize?: number;
    iceTransportPolicy?: TransportPolicy;
}

export const enum DescriptionType {
    Unspec = 'Unspec',
    Offer = 'Offer',
    Answer = 'Answer'
}

export const enum ReliabilityType {
    Reliable = 0, Rexmit = 1, Timed = 2
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
    }
}

export interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
}

// Must be same as rtc enum class Direction
export enum Direction {
    SendOnly = 1,
    RecvOnly = 2,
    SendRecv = 3,
    Inactive = 4,
    Unknown = 0
}

export class DataChannel {
    close: () => void;
    getLabel: () => string;
    sendMessage: (msg: string) => boolean;
    sendMessageBinary: (buffer: Buffer) => boolean;
    isOpen: () => boolean;
    availableAmount: () => Number;
    bufferedAmount: () => Number;
    maxMessageSize: () => Number;
    setBufferedAmountLowThreshold: (newSize: Number) => void;
    onOpen: (cb: () => void) => void;
    onClosed: (cb: () => void) => void;
    onError: (cb: (err: string) => void) => void;
    onAvailable: (cb: () => void) => void;
    onBufferedAmountLow: (cb: () => void) => void;
    onMessage: (cb: (msg: string | Buffer) => void) => void;
}

export class PeerConnection {
    constructor(peerName: string, config: RtcConfig);
    close: () => void;
    setRemoteDescription: (sdp: string, type: DescriptionType) => void;
    addRemoteCandidate: (candidate: string, mid: string) => void;
    createDataChannel: (label: string, config?: DataChannelInitConfig) => DataChannel;
    onLocalDescription: (cb: (sdp: string, type: DescriptionType) => void) => void;
    onLocalCandidate: (cb: (candidate: string, mid: string) => void) => void;
    onStateChange: (cb: (state: string) => void) => void;
    onGatheringStateChange: (state: (sdp: string) => void) => void;
    onDataChannel: (cb: (dc: DataChannel) => void) => void;
    bytesSent: () => number;
    bytesReceived: () => number;
    rtt: () => number;
    getSelectedCandidatePair: () => { local: SelectedCandidateInfo, remote: SelectedCandidateInfo } | null;
}
