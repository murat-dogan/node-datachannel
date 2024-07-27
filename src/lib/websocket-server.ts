import { EventEmitter } from 'events';
import nodeDataChannel from './node-datachannel.js';
import { WebSocketServerConfiguration } from './types.js';
import { WebSocket } from './websocket.js';

export class WebSocketServer extends EventEmitter {
    #server: any;
    #clients: WebSocket[] = [];

    constructor(options: WebSocketServerConfiguration) {
        super();
        this.#server = new nodeDataChannel.WebSocketServer(options);

        this.#server.onClient((client) => {
            this.emit('client', client);
            this.#clients.push(client);
        });
    }

    port(): number {
        return this.#server?.port() || 0;
    }

    stop(): void {
        this.#clients.forEach((client) => {
            client?.close();
        });
        this.#server?.stop();
        this.#server = null;
        this.removeAllListeners();
    }

    onClient(cb: (clientSocket: WebSocket) => void): void {
        if (this.#server) this.on('client', cb);
    }
}
