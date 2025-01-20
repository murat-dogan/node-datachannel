import { Readable } from 'node:stream'
import { MediaStreamTrackEvent } from './Events.js'
import { Track } from '../lib/index.js'

export class MediaStreamTrack extends EventTarget implements globalThis.MediaStreamTrack {
  media
  track: Track
  stream = new Readable({ read: () => {} })
  #kind: string
  #label: string
  #id = crypto.randomUUID()
  contentHint = ''

  onmute
  onunmute
  onended

  constructor ({ kind, label }: { kind: string, label: string }) {
    super()
    if (!kind) throw new TypeError("Failed to construct 'MediaStreamTrack': Failed to read the 'kind' property from 'MediaStreamTrackInit': Required member is undefined.")
    this.#kind = kind
    this.#label = label

    this.addEventListener('ended', e => {
      this.onended?.(e)
      this.track?.close()
      this.stream.destroy()
    })
    this.stream.on('close', () => {
      this.stop()
    })
  }

  async applyConstraints (): Promise<void> {
    console.warn('Constraints unsupported, ignored')
  }

  stop (): void {
    this.track?.close()
    this.stream.destroy()
    this.dispatchEvent(new Event('ended'))
  }

  getSettings (): globalThis.MediaTrackSettings {
    console.warn('Settings upsupported, ignored')
    return {}
  }

  getConstraints (): globalThis.MediaTrackConstraints {
    console.warn('Constraints unsupported, ignored')
    return {}
  }

  getCapabilities (): globalThis.MediaTrackCapabilities {
    console.warn('Capabilities unsupported, ignored')
    return {}
  }

  clone (): this {
    console.warn('Track clonning is unsupported, returned this instance')
    return this
  }

  get kind (): string {
    return this.#kind
  }

  get enabled (): boolean | null {
    return this.track?.isOpen()
  }

  set enabled (_) {
    console.warn('Track enabling and disabling is unsupported, ignored')
  }

  get muted (): boolean {
    return false
  }

  get id (): string {
    return this.#id
  }

  get label (): string {
    return this.#label
  }

  get readyState (): 'ended' | 'live' {
    return this.track?.isClosed() ? 'ended' : 'live'
  }
}

/**
 * @class
 * @implements {globalThis.MediaStream}
 */
export class MediaStream extends EventTarget {
  #active = true
  #id = crypto.randomUUID()
  #tracks = new Set<MediaStreamTrack>()
  onaddtrack
  onremovetrack
  onactive
  oninactive

  constructor (streamOrTracks) {
    super()
    if (streamOrTracks instanceof MediaStream) {
      for (const track of streamOrTracks.getTracks()) {
        this.addTrack(track)
      }
    } else if (Array.isArray(streamOrTracks)) {
      for (const track of streamOrTracks) {
        this.addTrack(track)
      }
    }
    this.addEventListener('active', e => {
      this.onactive?.(e)
    })
    this.addEventListener('inactive', e => {
      this.oninactive?.(e)
    })
    this.addEventListener('removetrack', e => {
      this.onremovetrack?.(e)
    })
    this.addEventListener('addtrack', e => {
      this.onaddtrack?.(e)
    })
    this.dispatchEvent(new Event('active'))
  }

  get active (): boolean {
    return this.#active
  }

  get id (): string {
    return this.#id
  }

  addTrack (track) {
    this.#tracks.add(track)
    this.dispatchEvent(new MediaStreamTrackEvent('addtrack', { track }))
  }

  getTracks (): MediaStreamTrack[] {
    return [...this.#tracks]
  }

  getVideoTracks (): MediaStreamTrack[] {
    return [...this.#tracks].filter(({ kind }) => kind === 'video')
  }

  getAudioTracks (): MediaStreamTrack[] {
    return [...this.#tracks].filter(({ kind }) => kind === 'audio')
  }

  getTrackById (id): MediaStreamTrack {
    return [...this.#tracks].find(track => track.id === id) ?? null
  }

  removeTrack (track): void {
    this.#tracks.delete(track)
    this.dispatchEvent(new MediaStreamTrackEvent('removetrack', { track }))
  }

  clone (): MediaStream {
    return new MediaStream([...this.getTracks()])
  }

  stop ():void {
    for (const track of this.getTracks()) {
      track.stop()
    }
    this.#active = false
    this.dispatchEvent(new Event('inactive'))
  }
}
