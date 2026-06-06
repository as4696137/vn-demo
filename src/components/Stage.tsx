import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '@/store/gameStore'
import { useTypewriter } from '@/engine/useTypewriter'
import { Background } from './Background'
import { CharaLayer } from './Character'
import { DialogueBox } from './DialogueBox'
import { ChoiceList } from './ChoiceList'
import { MinigameLayer } from './minigames'

export function Stage() {
  const {
    bg,
    characters,
    speaker,
    text,
    choices,
    minigame,
    advance,
    choose,
  } = useGameStore(
    useShallow((s) => ({
      bg: s.bg,
      characters: s.characters,
      speaker: s.speaker,
      text: s.text,
      choices: s.choices,
      minigame: s.minigame,
      advance: s.advance,
      choose: s.choose,
    })),
  )

  const { shown, done, skip } = useTypewriter(text)

  const onTap = () => {
    if (choices) return
    if (!done) skip()
    else advance()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onTap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // re-bind when state that onTap depends on changes
  }, [done, choices, text]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="absolute inset-0 cursor-pointer"
      onClick={onTap}
      role="presentation"
    >
      <Background id={bg} />
      <CharaLayer characters={characters} />
      <DialogueBox speaker={speaker} text={text} shown={shown} done={done} />
      {choices &&
        (minigame ? (
          <MinigameLayer minigame={minigame} choices={choices} onChoose={choose} />
        ) : (
          <ChoiceList choices={choices} onChoose={choose} />
        ))}
    </div>
  )
}
