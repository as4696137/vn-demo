import { AnimatePresence, motion } from 'framer-motion'
import { getCharaSrc } from '@/engine/assets'
import type { CharaState, Side } from '@/engine/types'

// placeholder 階段先把所有立繪都放在畫面正中，避免左右兩側被切掉。
// 之後有正式素材想分多人同框時，再恢復為 left / center / right 三種位移。
const POS_CLASS: Record<Side, string> = {
  left: 'left-1/2 -translate-x-1/2',
  center: 'left-1/2 -translate-x-1/2',
  right: 'left-1/2 -translate-x-1/2',
}

const SLIDE_FROM: Record<Side, number> = {
  left: -60,
  center: 0,
  right: 60,
}

export function CharaLayer({ characters }: { characters: CharaState[] }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {characters.map((c) => (
          <Character key={c.id} chara={c} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Character({ chara }: { chara: CharaState }) {
  const src = getCharaSrc(chara.id, chara.pose)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, x: SLIDE_FROM[chara.pos] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`absolute bottom-0 ${POS_CLASS[chara.pos]}`}
    >
      <motion.div
        key={chara.pose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {src ? (
          <img
            src={src}
            alt={chara.id}
            className="h-[78vh] w-auto select-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-[60vh] w-48 items-center justify-center rounded-lg bg-zinc-700/80 text-sm text-zinc-300">
            [missing chara: {chara.id}/{chara.pose}]
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
