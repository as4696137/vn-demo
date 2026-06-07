import { ChoiceList } from '@/components/ChoiceList'
import type { ChoiceOpt, MinigameRequest } from '@/engine/types'
import { LetterMinigame } from './LetterMinigame'
import type { MinigameComponent } from './types'

export const MINIGAME_REGISTRY: Record<string, MinigameComponent> = {
  letter: LetterMinigame,
}

type Props = {
  minigame: MinigameRequest
  choices: ChoiceOpt[]
  onChoose: (index: number) => void
}

export function MinigameLayer({ minigame, choices, onChoose }: Props) {
  const Component = MINIGAME_REGISTRY[minigame.id]

  // 未知 id 自動退回普通選項——不會卡住玩家。
  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[minigame] unknown id "${minigame.id}", falling back to ChoiceList`)
    }
    return <ChoiceList choices={choices} onChoose={onChoose} />
  }

  return <Component choices={choices} onChoose={onChoose} />
}
