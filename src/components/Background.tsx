import { AnimatePresence, motion } from 'framer-motion'
import { getBgSrc } from '@/engine/assets'

export function Background({ id }: { id: string | null }) {
  const src = id ? getBgSrc(id) : null

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence>
        {id && (
          <motion.div
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {src ? (
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                <span className="text-2xl">[missing bg: {id}]</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
