import { Audio, Direction, Track, Video } from '../lib/index.js'
import RTCDtlsTransport from './RTCDtlsTransport.js'
import RTCPeerConnection from './RTCPeerConnection.js'

const ndcDirectionMapFrom: Record<Direction, RTCRtpTransceiverDirection> = {
  Inactive: 'inactive',
  RecvOnly: 'recvonly',
  SendOnly: 'sendonly',
  SendRecv: 'sendrecv',
  Unknown: 'inactive'
}

const ndcDirectionMapTo: Record<RTCRtpTransceiverDirection, Direction> = {
  inactive: 'Inactive',
  recvonly: 'RecvOnly',
  sendonly: 'SendOnly',
  sendrecv: 'SendRecv',
  stopped: 'Inactive'
}

export class RTCRtpTransceiver implements globalThis.RTCRtpTransceiver {
  #transceiver: Video | Audio | Track
  #track: Track
  #desiredDirection: globalThis.RTCRtpTransceiverDirection
  #sender: RTCRtpSender
  #receiver: RTCRtpReceiver

  constructor ({ transceiver, pc }: { pc: RTCPeerConnection, transceiver: Video | Audio | Track }) {
    this.#transceiver = transceiver
    this.#sender = new RTCRtpSender({ pc })
    this.#receiver = new RTCRtpReceiver({ pc })
  }

  _setNDCTrack (track: Track): void {
    if (this.#track) return
    this.#track = track
  }

  get currentDirection (): RTCRtpTransceiverDirection {
    return ndcDirectionMapFrom[this.#transceiver.direction()]
  }

  close (): void {
    this.#track?.close()
    (this.#transceiver as Video | Audio).close?.()
  }

  get track (): Track {
    return this.#track
  }

  get media (): Video | Audio {
    return this.#transceiver as Video | Audio
  }

  get direction (): RTCRtpTransceiverDirection {
    return this.#desiredDirection
  }

  set direction (dir: RTCRtpTransceiverDirection) {
    this.#desiredDirection = dir
    if (!this.#sender) return
    (this.#transceiver as Video | Audio).setDirection(ndcDirectionMapTo[dir])
  }

  get mid (): string {
    return this.#transceiver.mid()
  }

  get sender (): RTCRtpSender {
    return this.#sender
  }

  get receiver (): RTCRtpReceiver {
    return this.#receiver
  }

  get stopped (): boolean | undefined {
    return this.#track?.isClosed()
  }

  setDirection (direction: RTCRtpTransceiverDirection): void {
    (this.#transceiver as Video | Audio).setDirection(ndcDirectionMapTo[direction])
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCodecPreferences (_codecs): void {
    // TODO
    // addVideoCodec(payloadType: number, codec: string, profile?: string): void;
    // addH264Codec(payloadType: number, profile?: string): void;
    // addVP8Codec(payloadType: number): void;
    // addVP9Codec(payloadType: number): void;
  }

  stop (): void {
    this.#track?.close()
  }
}

export class RTCRtpSender implements globalThis.RTCRtpSender {
  track
  transform // TODO, is it worth tho?
  #transport: RTCDtlsTransport
  #pc: RTCPeerConnection
  constructor ({ pc }: { pc: RTCPeerConnection }) {
    this.#transport = new RTCDtlsTransport({ pc })
    this.#pc = pc
  }

  get dtmf (): null {
    return null
  }

  get transport (): RTCDtlsTransport | null {
    return this.#transport ?? null
  }

  async getStats (): Promise<globalThis.RTCStatsReport> {
    return new Map()
  }

  getParameters (): RTCRtpSendParameters {
    return { encodings: [], codecs: [], transactionId: '', headerExtensions: [], rtcp: { reducedSize: false } }
  }

  async setParameters (): Promise<void> {
    // TODO
    // addVideoCodec(payloadType: number, codec: string, profile?: string): void;
    // addH264Codec(payloadType: number, profile?: string): void;
    // addVP8Codec(payloadType: number): void;
    // addVP9Codec(payloadType: number): void;
    // setBitrate
  }

  setStreams (streams): void {
    if (this.#pc.connectionState !== 'connected') throw new DOMException('Sender\'s connection is closed', 'InvalidStateError')
    if (!this.track) return
    for (const stream of streams) {
      stream.addTrack(this.track)
    }
  }

  async replaceTrack (): Promise<void> {
    throw new TypeError('Method unsupported')
  }
}

/**
 * @class
 * @implements {globalThis.RTCRtpReceiver}
 */
export class RTCRtpReceiver {
  transform // TODO, is it worth tho?
  #transport: RTCDtlsTransport
  track
  #jitterBufferTarget = 0
  
  constructor ({ pc }) {
    this.#transport = new RTCDtlsTransport({ pc })
  }

  get transport (): RTCDtlsTransport | null {
    return this.#transport ?? null
  }

  get jitterBufferTarget (): number {
    return this.#jitterBufferTarget
  }

  static getCapabilities (kind): globalThis.RTCRtpCapabilities {
    if (!kind) throw new TypeError("Failed to execute 'getCapabilities' on 'RTCRtpSender': 1 argument required, but only 0 present.")
    if (kind === 'video') {
      return {
        headerExtensions: [],
        codecs: [
          { mimeType: 'video/H264', clockRate: -1 },
          { mimeType: 'video/VP8', clockRate: -1},
          { mimeType: 'video/VP9', clockRate: -1 }
        ]
      }
    } else {
      return {
        headerExtensions: [],
        codecs: [
          { mimeType: 'video/opus', clockRate: -1 }
        ]
      }
    }
  }

  async getStats (): Promise<globalThis.RTCStatsReport> {
    return new Map()
  }

  getParameters (): RTCRtpSendParameters {
    return { encodings: [], codecs: [], transactionId: '', headerExtensions: [], rtcp: { reducedSize: false } }
  }

  getContributingSources (): [] {
    return []
  }

  getSynchronizationSources (): [] {
    return []
  }
}
