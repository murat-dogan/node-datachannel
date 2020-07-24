interface ErrorEventPayload {
    error: string;
}

interface MessageEventPayload {
    message: string;
}

export interface RtcConfig {
    iceServers: string[];
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