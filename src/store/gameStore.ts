import { create } from 'zustand'
import { InkRunner } from '@/engine/InkRunner'
import type {
  CharaState,
  ChoiceOpt,
  EndingId,
  MinigameRequest,
  SceneName,
} from '@/engine/types'
import { applyChara } from '@/engine/applyChara'
import { playBgm, playSe } from '@/engine/audio'
import inkStoryJson from '@/story/new-main.ink'

type GameState = {
  scene: SceneName
  bg: string | null
  characters: CharaState[]
  speaker: string | null
  text: string
  choices: ChoiceOpt[] | null
  bgm: string | null
  endingId: EndingId | null
  minigame: MinigameRequest | null

  start: () => void
  advance: () => void
  choose: (index: number) => void
  confirmEnd: () => void
  toMenu: () => void
}

let runner: InkRunner | null = null

const initial = {
  scene: 'menu' as SceneName,
  bg: null,
  characters: [] as CharaState[],
  speaker: null,
  text: '',
  choices: null,
  bgm: null,
  endingId: null as EndingId | null,
  minigame: null as MinigameRequest | null,
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initial,

  start: () => {
    runner = new InkRunner(inkStoryJson)
    set({ ...initial, scene: 'play' })
    get().advance()
  },

  advance: () => {
    if (!runner) return
    if (get().choices) return

    // Loop so directive-only lines are applied immediately without an empty
    // dialogue beat in between.
    while (runner) {
      const result = runner.step()

      if (result.type === 'end') {
        const raw = runner.getVariable('ending_id')
        const endingId: EndingId | null =
          raw === 'A' || raw === 'B' || raw === 'C' ? raw : null
        set({ scene: 'fading', endingId, choices: null, text: '', minigame: null })
        playBgm(null)
        return
      }

      if (result.type === 'choices') {
        set({ choices: result.choices, speaker: null, text: '' })
        return
      }

      let { bg, bgm, characters, minigame } = get()
      let speaker: string | null = null

      for (const d of result.directives) {
        switch (d.kind) {
          case 'speaker':
            speaker = d.name
            break
          case 'bg':
            bg = d.id
            break
          case 'bgm':
            bgm = d.id
            playBgm(d.id)
            break
          case 'se':
            playSe(d.id)
            break
          case 'chara':
            characters = applyChara(characters, d)
            break
          case 'clear':
            characters = []
            break
          case 'minigame':
            minigame = { id: d.id }
            break
        }
      }

      if (result.text) {
        set({ bg, bgm, characters, speaker, text: result.text, minigame })
        return
      }
      // empty text + directives only: apply state and keep looping
      set({ bg, bgm, characters, minigame })
    }
  },

  choose: (index) => {
    if (!runner) return
    runner.choose(index)
    set({ choices: null, minigame: null })
    get().advance()
  },

  confirmEnd: () => {
    set({ scene: 'end' })
  },

  toMenu: () => {
    runner = null
    playBgm(null)
    set({ ...initial })
  },
}))
