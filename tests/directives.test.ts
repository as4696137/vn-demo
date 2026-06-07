import { describe, expect, it } from 'vitest'
import { parseTag, parseTags } from '@/engine/directives'

describe('parseTag', () => {
  describe('rejection cases', () => {
    it.each([
      ['empty string', ''],
      ['only whitespace', '   '],
      ['no colon and not "clear"', 'just-some-text'],
      ['unknown kind', 'unknown: value'],
      ['empty speaker', 'speaker:'],
      ['empty bg', 'bg:'],
      ['empty se', 'se:'],
      ['empty minigame', 'minigame:'],
      ['empty chara id', 'chara:'],
      ['chara with only props (no id)', 'chara:  pose=happy'],
    ])('returns null for %s', (_label, input) => {
      expect(parseTag(input)).toBeNull()
    })
  })

  describe('clear', () => {
    it('parses bare "clear"', () => {
      expect(parseTag('clear')).toEqual({ kind: 'clear' })
    })

    it('trims whitespace around "clear"', () => {
      expect(parseTag('  clear  ')).toEqual({ kind: 'clear' })
    })
  })

  describe('speaker', () => {
    it('parses a speaker name', () => {
      expect(parseTag('speaker: 小雯')).toEqual({ kind: 'speaker', name: '小雯' })
    })

    it('trims whitespace around the name', () => {
      expect(parseTag('speaker:   Jason   ')).toEqual({ kind: 'speaker', name: 'Jason' })
    })
  })

  describe('bg', () => {
    it('parses an id', () => {
      expect(parseTag('bg: office_day')).toEqual({ kind: 'bg', id: 'office_day' })
    })
  })

  describe('bgm', () => {
    it('parses an id', () => {
      expect(parseTag('bgm: office_hum')).toEqual({ kind: 'bgm', id: 'office_hum' })
    })

    it('treats empty value as stop', () => {
      expect(parseTag('bgm:')).toEqual({ kind: 'bgm', id: null })
    })

    it.each(['none', 'stop'])('treats "%s" as stop', (sentinel) => {
      expect(parseTag(`bgm: ${sentinel}`)).toEqual({ kind: 'bgm', id: null })
    })
  })

  describe('se', () => {
    it('parses an id', () => {
      expect(parseTag('se: click')).toEqual({ kind: 'se', id: 'click' })
    })
  })

  describe('minigame', () => {
    it('parses an id', () => {
      expect(parseTag('minigame: letter')).toEqual({ kind: 'minigame', id: 'letter' })
    })
  })

  describe('chara', () => {
    it('parses just an id (pose/pos undefined, not exiting)', () => {
      expect(parseTag('chara: xiaowen')).toEqual({
        kind: 'chara',
        id: 'xiaowen',
        pose: undefined,
        pos: undefined,
        exit: false,
      })
    })

    it('parses pose', () => {
      expect(parseTag('chara: xiaowen pose=happy')).toEqual({
        kind: 'chara',
        id: 'xiaowen',
        pose: 'happy',
        pos: undefined,
        exit: false,
      })
    })

    it.each(['left', 'center', 'right'] as const)('parses pos=%s', (side) => {
      expect(parseTag(`chara: xiaowen pos=${side}`)).toEqual({
        kind: 'chara',
        id: 'xiaowen',
        pose: undefined,
        pos: side,
        exit: false,
      })
    })

    it('ignores invalid pos values', () => {
      expect(parseTag('chara: xiaowen pos=upside_down')).toEqual({
        kind: 'chara',
        id: 'xiaowen',
        pose: undefined,
        pos: undefined,
        exit: false,
      })
    })

    it('parses exit', () => {
      expect(parseTag('chara: xiaowen exit')).toEqual({
        kind: 'chara',
        id: 'xiaowen',
        pose: undefined,
        pos: undefined,
        exit: true,
      })
    })

    it('parses all attributes together (any order)', () => {
      expect(parseTag('chara: jason pose=frown pos=left exit')).toEqual({
        kind: 'chara',
        id: 'jason',
        pose: 'frown',
        pos: 'left',
        exit: true,
      })
    })

    it('handles arbitrary whitespace between tokens', () => {
      expect(parseTag('chara:   awei    pose=grin   pos=center')).toEqual({
        kind: 'chara',
        id: 'awei',
        pose: 'grin',
        pos: 'center',
        exit: false,
      })
    })
  })
})

describe('parseTags', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['empty array', []],
  ])('returns [] for %s', (_label, input) => {
    expect(parseTags(input)).toEqual([])
  })

  it('parses every valid tag in order', () => {
    const tags = ['bg: office', 'speaker: 你', 'se: click']
    expect(parseTags(tags)).toEqual([
      { kind: 'bg', id: 'office' },
      { kind: 'speaker', name: '你' },
      { kind: 'se', id: 'click' },
    ])
  })

  it('silently drops tags that fail to parse', () => {
    const tags = ['bg: office', 'garbage', '', 'se: click']
    expect(parseTags(tags)).toEqual([
      { kind: 'bg', id: 'office' },
      { kind: 'se', id: 'click' },
    ])
  })
})
