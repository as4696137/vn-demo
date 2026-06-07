import { Story } from 'inkjs'
import { parseTags } from './directives'
import type { ChoiceOpt, Directive } from './types'

export type StepResult =
  | { type: 'line'; text: string; directives: Directive[] }
  | { type: 'choices'; choices: ChoiceOpt[] }
  | { type: 'end' }

type InkChoice = { text: string }
type InkStory = {
  canContinue: boolean
  currentTags: string[] | null
  currentChoices: InkChoice[]
  variablesState: Record<string, unknown>
  Continue(): string
  ChooseChoiceIndex(i: number): void
}

export class InkRunner {
  private story: InkStory

  constructor(compiledJson: unknown) {
    this.story = new Story(compiledJson as never) as unknown as InkStory
  }

  step(): StepResult {
    if (this.story.canContinue) {
      const text = this.story.Continue().trim()
      const directives = parseTags(this.story.currentTags)
      return { type: 'line', text, directives }
    }
    if (this.story.currentChoices.length > 0) {
      return {
        type: 'choices',
        choices: this.story.currentChoices.map((c, i) => ({
          index: i,
          text: c.text,
        })),
      }
    }
    return { type: 'end' }
  }

  choose(index: number) {
    this.story.ChooseChoiceIndex(index)
  }

  getVariable(name: string): string | number | boolean | null {
    const v = this.story.variablesState[name]
    if (v == null) return null
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      return v
    }
    return String(v)
  }
}
