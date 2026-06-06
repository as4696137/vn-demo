import { motion } from 'framer-motion'
import type { ChoiceOpt } from '@/engine/types'

type Props = {
  choices: ChoiceOpt[]
  onChoose: (index: number) => void
}

export function ChoiceList({ choices, onChoose }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="flex w-full max-w-2xl flex-col gap-3 px-6">
        {choices.map((c, i) => (
          <motion.button
            key={c.index}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              onChoose(c.index)
            }}
            className="rounded-xl border border-[#e8b890]/30 bg-[#1a0e08]/40 px-6 py-4 text-lg text-[#fdf2dc] shadow-lg backdrop-blur-md transition hover:border-[#d96f3d] hover:bg-[#bf4e22]/30"
          >
            {c.text}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
