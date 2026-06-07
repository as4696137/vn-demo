import type { CharaState, Directive, Side } from './types'

/**
 * Given the current character list and a `chara` directive, return the new
 * character list. Pure — no shared state, no mutation of inputs.
 *
 * Semantics:
 *   - `exit`     removes the matching character (no-op if absent)
 *   - new id     appends with the directive's pose/pos (defaulting to neutral/center)
 *   - existing id  updates pose/pos in place; omitted fields carry forward
 *                  the existing values (not the defaults), so e.g. updating
 *                  `pose=happy` without `pos=` keeps the original position.
 */
export function applyChara(
  list: CharaState[],
  d: Extract<Directive, { kind: 'chara' }>,
): CharaState[] {
  if (d.exit) {
    return list.filter((c) => c.id !== d.id)
  }
  const existing = list.find((c) => c.id === d.id)
  const next: CharaState = {
    id: d.id,
    pose: d.pose ?? existing?.pose ?? 'neutral',
    pos: (d.pos ?? existing?.pos ?? 'center') as Side,
  }
  if (existing) return list.map((c) => (c.id === d.id ? next : c))
  return [...list, next]
}
