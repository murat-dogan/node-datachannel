import RTCDataChannel from './RTCDataChannel';
import RTCIceCandidate from './RTCIceCandidate';


export class RTCPeerConnectionIceEvent extends Event implements globalThis.RTCPeerConnectionIceEvent {
    #candidate: RTCIceCandidate;

    constructor(candidate: RTCIceCandidate) {
        super('icecandidate');

        this.#candidate = candidate;
    }

    get candidate(): RTCIceCandidate {
        return this.#candidate;
    }

    get url (): string {
        return '' // TODO ?
    }
}

export class RTCDataChannelEvent extends Event implements globalThis.RTCDataChannelEvent {
    #channel: RTCDataChannel;

    // type is defined as a consturctor, but always overwritten, interesting spec
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_type: string = 'datachannel', init: globalThis.RTCDataChannelEventInit) {
        if (arguments.length === 0) throw new TypeError(`Failed to construct 'RTCDataChannelEvent': 2 arguments required, but only ${arguments.length} present.`)
        if (typeof init !== 'object') throw new TypeError("Failed to construct 'RTCDataChannelEvent': The provided value is not of type 'RTCDataChannelEventInit'.")
        if (!init.channel) throw new TypeError("Failed to construct 'RTCDataChannelEvent': Failed to read the 'channel' property from 'RTCDataChannelEventInit': Required member is undefined.")
        if (init.channel.constructor !== RTCDataChannel) throw new TypeError("Failed to construct 'RTCDataChannelEvent': Failed to read the 'channel' property from 'RTCDataChannelEventInit': Failed to convert value to 'RTCDataChannel'.")
        super('datachannel')

        this.#channel = init.channel;
    }

    get channel(): RTCDataChannel {
        return this.#channel;
    }
}

export class RTCErrorEvent extends Event implements globalThis.RTCErrorEvent {
    #error: RTCError
    constructor (type: string, init: globalThis.RTCErrorEventInit) {
        if (arguments.length < 2) throw new TypeError(`Failed to construct 'RTCErrorEvent': 2 arguments required, but only ${arguments.length} present.`)
        if (typeof init !== 'object') throw new TypeError("Failed to construct 'RTCErrorEvent': The provided value is not of type 'RTCErrorEventInit'.")
        if (!init.error) throw new TypeError("Failed to construct 'RTCErrorEvent': Failed to read the 'error' property from 'RTCErrorEventInit': Required member is undefined.")
        if (init.error.constructor !== RTCError) throw new TypeError("Failed to construct 'RTCErrorEvent': Failed to read the 'error' property from 'RTCErrorEventInit': Failed to convert value to 'RTCError'.")
        super(type || 'error')
        this.#error = init.error
    }

    get error (): RTCError {
        return this.#error
    }
}

export class MediaStreamTrackEvent extends Event implements globalThis.MediaStreamTrackEvent {
    #track: MediaStreamTrack

    constructor (type, init) {
        if (arguments.length === 0) throw new TypeError(`Failed to construct 'MediaStreamTrackEvent': 2 arguments required, but only ${arguments.length} present.`)
        if (typeof init !== 'object') throw new TypeError("Failed to construct 'MediaStreamTrackEvent': The provided value is not of type 'MediaStreamTrackEventInit'.")
        if (!init.track) throw new TypeError("Failed to construct 'MediaStreamTrackEvent': Failed to read the 'track' property from 'MediaStreamTrackEventInit': Required member is undefined.")
        if (init.track.constructor !== MediaStreamTrack) throw new TypeError("Failed to construct 'MediaStreamTrackEvent': Failed to read the 'channel' property from 'MediaStreamTrackEventInit': Failed to convert value to 'RTCDataChannel'.")

        super(type)

        this.#track = init.track
    }

    get track (): MediaStreamTrack {
        return this.#track
    }
}
