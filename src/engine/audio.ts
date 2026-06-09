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

// Cache one Howl per SE id. First playSe(id) does the fetch + decode; the
// instance is then reused, so subsequent plays are instant. `prefetchSes()`
// warms the whole set up-front so the *first* play is also instant.
const seCache = new Map<string, Howl>()

function getSe(id: string): Howl | null {
  const cached = seCache.get(id)
  if (cached) return cached
  const src = SE_REGISTRY[id]
  if (!src) return null
  const h = new Howl({ src: [src], volume: 0.8, preload: true })
  seCache.set(id, h)
  return h
}

export function playSe(id: string) {
  getSe(id)?.play()
}

export function prefetchSes() {
  for (const id of Object.keys(SE_REGISTRY)) getSe(id)
}
