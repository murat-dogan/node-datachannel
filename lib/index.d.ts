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
    setCallback: (cb:
        (
            event: 'open' | 'closed' | 'error' | 'available' | 'buffered-amount-low' | 'message',
            payload: ErrorEventPayload | MessageEventPayload
        ) => void) => void;
    getLabel: () => string;
    sendMessage: (msg: string) => boolean;
    isOpen: () => boolean;
    availableAmount: () => Number;
    bufferedAmount: () => Number;
    maxMessageSize: () => Number;

}

export class PeerConnection {
    constructor(peerName: string, config: RtcConfig,
        cb: (
            event: 'sdp' | 'candidate' | 'state' | 'gathering-state"' | 'data-channel',
            payload: string | DataChannel
        ) => void);
    close: () => void;
    setRemoteDescription: (sdp: string) => void;
    addRemoteCandidate: (candidate: string) => void;
    createDataChannel: (label: string) => DataChannel;
}