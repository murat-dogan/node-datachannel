export interface Channel {
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Uint8Array): boolean;
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

export interface WebSocketServerConfiguration {
    port?: number; // default 8080
    enableTls?: boolean; // default = false;
    certificatePemFile?: string;
    keyPemFile?: string;
    keyPemPass?: string;
    bindAddress?: string;
    connectionTimeout?: number; // milliseconds
    maxMessageSize?: number;
}

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

// Proxy Server
export type ProxyServerType = 'Socks5' | 'Http';
export interface ProxyServer {
    type: ProxyServerType;
    ip: string;
    port: number;
    username?: string;
    password?: string;
}

export type RelayType = 'TurnUdp' | 'TurnTcp' | 'TurnTls'

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
    disableFingerprintVerification?: boolean;
    disableAutoGathering?: boolean;
    certificatePemFile?: string;
    keyPemFile?: string;
    keyPemPass?: string;
}

// Lowercase to match the description type string from libdatachannel
export type DescriptionType = 'unspec' | 'offer' | 'answer' | 'pranswer' | 'rollback'

export type RTCSdpType = 'answer' | 'offer' | 'pranswer' | 'rollback';

export type RTCIceTransportState = "checking" | "closed" | "completed" | "connected" | "disconnected" | "failed" | "new";
export type RTCPeerConnectionState = "closed" | "connected" | "connecting" | "disconnected" | "failed" | "new";
export type RTCIceConnectionState = "checking" | "closed" | "completed" | "connected" | "disconnected" | "failed" | "new";
export type RTCIceGathererState = "complete" | "gathering" | "new";
export type RTCIceGatheringState = "complete" | "gathering" | "new";
export type RTCSignalingState = "closed" | "have-local-offer" | "have-local-pranswer" | "have-remote-offer" | "have-remote-pranswer" | "stable";

export interface LocalDescriptionInit {
    iceUfrag?: string;
    icePwd?: string;
}

export interface DataChannelInitConfig {
    protocol?: string;
    negotiated?: boolean;
    id?: number;
    unordered?: boolean; // Reliability
    maxPacketLifeTime?: number; // Reliability
    maxRetransmits?: number; // Reliability
}

export interface CertificateFingerprint {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/RTCCertificate/getFingerprints#value
     */
    value: string;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/RTCCertificate/getFingerprints#algorithm
     */
    algorithm: 'sha-1' | 'sha-224' | 'sha-256' | 'sha-384' | 'sha-512' | 'md5' | 'md2';
}

export interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
    candidate: string;
    mid: string;
    priority: number;
}

// Must be same as rtc enum class Direction
export type Direction = 'SendOnly' | 'RecvOnly' | 'SendRecv' | 'Inactive' | 'Unknown'

export interface IceUdpMuxRequest {
    ufrag: string;
    host: string;
    port: number;
}
