export type Side = 'left' | 'center' | 'right'

export type Directive =
  | { kind: 'speaker'; name: string }
  | { kind: 'bg'; id: string }
  | { kind: 'bgm'; id: string | null }
  | { kind: 'se'; id: string }
  | { kind: 'chara'; id: string; pose?: string; pos?: Side; exit?: boolean }
  | { kind: 'clear' }
  | { kind: 'minigame'; id: string }

export type MinigameRequest = {
  id: string
}

export type CharaState = {
  id: string
  pose: string
  pos: Side
}

export type ChoiceOpt = {
  index: number
  text: string
}

export type SceneName = 'menu' | 'play' | 'fading' | 'end'

export type EndingId = 'A' | 'B' | 'C'
