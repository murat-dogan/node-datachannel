import nodeDataChannel from './node-datachannel';
import { Channel, WebSocketServerConfiguration } from './types';

export interface WebSocket extends Channel {
    open(url: string): void;
    forceClose(): void;
    remoteAddress(): string | undefined;
    path(): string | undefined;

    // Channel implementation
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
    onMessage(cb: (msg: string | Buffer) => void): void;
}
export const WebSocket: {
    new(config?: WebSocketServerConfiguration): WebSocket
} = nodeDataChannel.WebSocket
