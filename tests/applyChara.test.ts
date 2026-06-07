import { describe, expect, it } from 'vitest'
import { applyChara } from '@/engine/applyChara'
import type { CharaState, Directive } from '@/engine/types'

type CharaDirective = Extract<Directive, { kind: 'chara' }>

const dir = (overrides: Partial<CharaDirective> & { id: string }): CharaDirective => ({
  kind: 'chara',
  exit: false,
  ...overrides,
})

const state = (...c: CharaState[]): CharaState[] => c

describe('applyChara', () => {
  describe('enter (id not in list)', () => {
    it('appends with explicit pose/pos', () => {
      const next = applyChara([], dir({ id: 'xiaowen', pose: 'gentle', pos: 'right' }))
      expect(next).toEqual([{ id: 'xiaowen', pose: 'gentle', pos: 'right' }])
    })

    it('defaults pose to "neutral" and pos to "center" when omitted', () => {
      const next = applyChara([], dir({ id: 'xiaowen' }))
      expect(next).toEqual([{ id: 'xiaowen', pose: 'neutral', pos: 'center' }])
    })

    it('preserves order: appends to end', () => {
      const initial = state({ id: 'awei', pose: 'grin', pos: 'left' })
      const next = applyChara(initial, dir({ id: 'jason', pose: 'neutral', pos: 'right' }))
      expect(next.map((c) => c.id)).toEqual(['awei', 'jason'])
    })
  })

  describe('update (id already in list)', () => {
    it('replaces matching entry in place (preserves position in list)', () => {
      const initial = state(
        { id: 'awei', pose: 'grin', pos: 'left' },
        { id: 'xiaowen', pose: 'neutral', pos: 'right' },
        { id: 'jason', pose: 'frown', pos: 'center' },
      )
      const next = applyChara(initial, dir({ id: 'xiaowen', pose: 'sad' }))
      expect(next.map((c) => c.id)).toEqual(['awei', 'xiaowen', 'jason'])
      expect(next[1]).toEqual({ id: 'xiaowen', pose: 'sad', pos: 'right' })
    })

    it('carries forward existing pose when directive omits it', () => {
      const initial = state({ id: 'xiaowen', pose: 'gentle', pos: 'right' })
      const next = applyChara(initial, dir({ id: 'xiaowen', pos: 'left' }))
      expect(next).toEqual([{ id: 'xiaowen', pose: 'gentle', pos: 'left' }])
    })

    it('carries forward existing pos when directive omits it', () => {
      const initial = state({ id: 'xiaowen', pose: 'gentle', pos: 'right' })
      const next = applyChara(initial, dir({ id: 'xiaowen', pose: 'sad' }))
      expect(next).toEqual([{ id: 'xiaowen', pose: 'sad', pos: 'right' }])
    })

    it('returns a new array (does not mutate the input)', () => {
      const initial = state({ id: 'xiaowen', pose: 'gentle', pos: 'right' })
      const next = applyChara(initial, dir({ id: 'xiaowen', pose: 'sad' }))
      expect(next).not.toBe(initial)
      expect(initial[0]).toEqual({ id: 'xiaowen', pose: 'gentle', pos: 'right' })
    })
  })

  describe('exit', () => {
    it('removes the matching character', () => {
      const initial = state(
        { id: 'awei', pose: 'grin', pos: 'left' },
        { id: 'xiaowen', pose: 'gentle', pos: 'right' },
      )
      const next = applyChara(initial, dir({ id: 'xiaowen', exit: true }))
      expect(next).toEqual([{ id: 'awei', pose: 'grin', pos: 'left' }])
    })

    it('is a no-op when the id is not in the list', () => {
      const initial = state({ id: 'awei', pose: 'grin', pos: 'left' })
      const next = applyChara(initial, dir({ id: 'xiaowen', exit: true }))
      expect(next).toEqual(initial)
    })

    it('ignores pose/pos on the exit directive', () => {
      const initial = state({ id: 'xiaowen', pose: 'gentle', pos: 'right' })
      const next = applyChara(initial, dir({
        id: 'xiaowen',
        exit: true,
        pose: 'sad',
        pos: 'left',
      }))
      expect(next).toEqual([])
    })
  })
})
