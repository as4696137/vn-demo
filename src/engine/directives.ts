import type { Directive, Side } from './types'

const isSide = (v: string): v is Side =>
  v === 'left' || v === 'center' || v === 'right'

export function parseTag(raw: string): Directive | null {
  const tag = raw.trim()
  if (!tag) return null
  if (tag === 'clear') return { kind: 'clear' }

  const colon = tag.indexOf(':')
  if (colon === -1) return null
  const key = tag.slice(0, colon).trim()
  const rest = tag.slice(colon + 1).trim()

  switch (key) {
    case 'speaker':
      return rest ? { kind: 'speaker', name: rest } : null
    case 'bg':
      return rest ? { kind: 'bg', id: rest } : null
    case 'bgm':
      if (!rest || rest === 'none' || rest === 'stop') return { kind: 'bgm', id: null }
      return { kind: 'bgm', id: rest }
    case 'se':
      return rest ? { kind: 'se', id: rest } : null
    case 'minigame':
      return rest ? { kind: 'minigame', id: rest } : null
    case 'chara': {
      const parts = rest.split(/\s+/).filter(Boolean)
      const id = parts[0]
      // Reject if the first token looks like a prop — otherwise a directive
      // like `chara: pose=happy` (missing id) silently treats the prop as id.
      if (!id || id === 'exit' || id.includes('=')) return null
      let pose: string | undefined
      let pos: Side | undefined
      let exit = false
      for (const p of parts.slice(1)) {
        if (p === 'exit') exit = true
        else if (p.startsWith('pose=')) pose = p.slice(5)
        else if (p.startsWith('pos=')) {
          const v = p.slice(4)
          if (isSide(v)) pos = v
        }
      }
      return { kind: 'chara', id, pose, pos, exit }
    }
    default:
      return null
  }
}

export function parseTags(tags: readonly string[] | null | undefined): Directive[] {
  if (!tags) return []
  const out: Directive[] = []
  for (const t of tags) {
    const d = parseTag(t)
    if (d) out.push(d)
  }
  return out
}
