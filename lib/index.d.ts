export as namespace NodeDataChannel;

export enum LogLevel {
    Verbose = 'Verbose',
    Debug = 'Debug',
    Info = 'Info',
    Warning = 'Warning',
    Error = 'Error',
    Fatal = 'Fatal'
}

// Functions
export function preload(): void;
export function initLogger(level: LogLevel): void;
export function cleanup(): void;

export enum ProxyServerType {
    None = 'None',
    Socks5 = 'Socks5',
    Http = 'Http'
}

export interface ProxyServer {
    type: ProxyServerType;
    ip: string;
    port: Number;
    username?: string;
    password?: string;
}

export interface RtcConfig {
    iceServers: string[];
    proxyServer?: ProxyServer;
    enableIceTcp?: boolean;
    portRangeBegin?: Number;
    portRangeEnd?: Number;
}

export enum DescriptionType {
    Unspec = 'Unspec',
    Offer = 'Offer',
    Answer = 'Answer'
}

export enum ReliabilityType {
    Reliable = 0, Rexmit = 1, Timed = 2
}

export interface DataChannelInitConfig {
    reliability: {
        type: ReliabilityType;
        unordered: boolean;
        rexmit: number;
    }
    negotiated: boolean;
    protocol: string;
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
}