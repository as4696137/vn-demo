import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { MainMenu } from '@/components/MainMenu'
import { Stage } from '@/components/Stage'

const EndingScreen = lazy(() =>
  import('@/components/EndingScreen').then((m) => ({ default: m.EndingScreen })),
)

export default function App() {
  const scene = useGameStore((s) => s.scene)
  const endingId = useGameStore((s) => s.endingId)
  const start = useGameStore((s) => s.start)
  const confirmEnd = useGameStore((s) => s.confirmEnd)

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {scene === 'menu' && <MainMenu onStart={start} />}
      {(scene === 'play' || scene === 'fading') && <Stage />}
      {scene === 'fading' && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeIn' }}
          onAnimationComplete={confirmEnd}
        />
      )}
      {scene === 'end' && endingId && (
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <EndingScreen endingId={endingId} />
        </Suspense>
      )}
    </div>
  )
}
