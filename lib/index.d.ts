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
export function initLogger(level: LogLevel): void;

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

export class DataChannel {
    close: () => void;
    getLabel: () => string;
    sendMessage: (msg: string) => boolean;
    isOpen: () => boolean;
    availableAmount: () => Number;
    bufferedAmount: () => Number;
    maxMessageSize: () => Number;
    onOpen: (cb: () => void) => void;
    onClosed: (cb: () => void) => void;
    onError: (cb: (err: string) => void) => void;
    onAvailable: (cb: () => void) => void;
    onBufferedAmountLow: (cb: () => void) => void;
    onMessage: (cb: (msg: string) => void) => void;
}

export class PeerConnection {
    constructor(peerName: string, config: RtcConfig);
    close: () => void;
    setRemoteDescription: (sdp: string) => void;
    addRemoteCandidate: (candidate: string) => void;
    createDataChannel: (label: string) => DataChannel;
    onLocalDescription: (cb: (sdp: string) => void) => void;
    onLocalCandidate: (cb: (candidate: string) => void) => void;
    onStateChange: (cb: (state: string) => void) => void;
    onGatheringStateChange: (state: (sdp: string) => void) => void;
    onDataChannel: (cb: (dc: DataChannel) => void) => void;
}