import { Howl } from 'howler'
import { BGM_REGISTRY, SE_REGISTRY } from './assets'

let currentBgm: Howl | null = null
let currentBgmId: string | null = null

const FADE_MS = 600

export function playBgm(id: string | null) {
  if (id === currentBgmId) return

  if (currentBgm) {
    const dying = currentBgm
    dying.fade(dying.volume(), 0, FADE_MS)
    setTimeout(() => dying.stop(), FADE_MS + 50)
    currentBgm = null
  }

  currentBgmId = id
  if (!id) return

  const src = BGM_REGISTRY[id]
  if (!src) return // silently ignore unregistered IDs (placeholder mode)

  const h = new Howl({ src: [src], loop: true, volume: 0, html5: false })
  h.play()
  h.fade(0, 0.6, FADE_MS)
  currentBgm = h
}

export function playSe(id: string) {
  const src = SE_REGISTRY[id]
  if (!src) return
  new Howl({ src: [src], volume: 0.8 }).play()
}
