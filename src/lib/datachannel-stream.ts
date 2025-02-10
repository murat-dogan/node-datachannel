/* eslint-disable @typescript-eslint/no-explicit-any */
import * as stream from 'stream';

/**
 * Turns a node-datachannel DataChannel into a real Node.js stream, complete with buffering,
 * backpressure (up to a point - if the buffer fills up, messages are dropped), and
 * support for piping data elsewhere.
 *
 * Read & written data may be either UTF-8 strings or Buffers - this difference exists at
 * the protocol level, and is preserved here throughout.
 */
export default class DataChannelStream extends stream.Duplex {
    private _rawChannel: any;
    private _readActive: boolean;


    constructor(rawChannel: any, streamOptions?: Omit<stream.DuplexOptions, 'objectMode'>) {
        super({
            allowHalfOpen: false, // Default to autoclose on end().
            ...streamOptions,
            objectMode: true, // Preserve the string/buffer distinction (WebRTC treats them differently)
        });

        this._rawChannel = rawChannel;
        this._readActive = true;

        rawChannel.onMessage((msg: any) => {
            if (!this._readActive) return; // If the buffer is full, drop messages.

            // If the push is rejected, we pause reading until the next call to _read().
            this._readActive = this.push(msg);
        });

        // When the DataChannel closes, the readable & writable ends close
        rawChannel.onClosed(() => {
            this.push(null);
            this.destroy();
        });

        rawChannel.onError((errMsg: string) => {
            this.destroy(new Error(`DataChannel error: ${errMsg}`));
        });

        // Buffer all writes until the DataChannel opens
        if (!rawChannel.isOpen()) {
            this.cork();
            rawChannel.onOpen(() => this.uncork());
        }
    }

    _read(): void {
        // Stop dropping messages, if the buffer filling up meant we were doing so before.
        this._readActive = true;
    }

    _write(chunk, _encoding, callback): void {
        let sentOk;

        try {
            if (Buffer.isBuffer(chunk)) {
                sentOk = this._rawChannel.sendMessageBinary(chunk);
            } else if (typeof chunk === 'string') {
                sentOk = this._rawChannel.sendMessage(chunk);
            } else {
                const typeName = chunk.constructor.name || typeof chunk;
                throw new Error(`Cannot write ${typeName} to DataChannel stream`);
            }
        } catch (err) {
            return callback(err);
        }

        if (sentOk) {
            callback(null);
        } else {
            callback(new Error('Failed to write to DataChannel'));
        }
    }

    _final(callback): void {
        if (!this.allowHalfOpen) this.destroy();
        callback(null);
    }

    _destroy(maybeErr, callback): void {
        // When the stream is destroyed, we close the DataChannel.
        this._rawChannel.close();
        callback(maybeErr);
    }

    get label(): string {
        return this._rawChannel.getLabel();
    }

    get id(): number {
        return this._rawChannel.getId();
    }

    get protocol(): string {
        return this._rawChannel.getProtocol();
    }
}
