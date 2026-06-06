import type { ChoiceOpt } from '@/engine/types'

/**
 * 所有 mini-game 元件的統一 props。
 *
 * 慣例：mini-game 內部以 choice index 對應「動作」。
 * 每個 mini-game 在檔案開頭註明哪個 index 對應哪個動作，
 * 確保劇本作者寫選項順序時跟元件對得起來。
 */
export type MinigameProps = {
  choices: ChoiceOpt[]
  onChoose: (index: number) => void
}

export type MinigameComponent = (props: MinigameProps) => React.ReactNode
