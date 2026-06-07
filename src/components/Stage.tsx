import { lazy, Suspense, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '@/store/gameStore'
import { useTypewriter } from '@/engine/useTypewriter'
import { prefetchAssets } from '@/engine/assets'
import { Background } from './Background'
import { CharaLayer } from './Character'
import { DialogueBox } from './DialogueBox'
import { ChoiceList } from './ChoiceList'

const MinigameLayer = lazy(() =>
  import('./minigames').then((m) => ({ default: m.MinigameLayer })),
)

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

  // Warm the cache once on first mount, after the initial scene has painted.
  useEffect(() => {
    const t = window.setTimeout(() => prefetchAssets(bg), 300)
    return () => window.clearTimeout(t)
    // intentionally fire once
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          <Suspense fallback={null}>
            <MinigameLayer minigame={minigame} choices={choices} onChoose={choose} />
          </Suspense>
        ) : (
          <ChoiceList choices={choices} onChoose={choose} />
        ))}
    </div>
  )
}
