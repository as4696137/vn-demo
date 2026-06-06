import { motion } from 'framer-motion'

type Props = {
  speaker: string | null
  text: string
  shown: string
  done: boolean
}

export function DialogueBox({ speaker, text, shown, done }: Props) {
  if (!text) return null

  if (!speaker) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-20">
        <motion.p
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl px-10 text-center text-[1.15rem] leading-[2] tracking-wider text-white/90"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)' }}
        >
          {shown}
          {!done && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
        </motion.p>
        {done && (
          <p className="mt-5 animate-pulse text-xs tracking-[0.3em] text-white/30">▼</p>
        )}
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute right-0 bottom-0 left-0 px-4 pb-6 sm:px-12 sm:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative mx-auto max-w-4xl rounded-2xl border border-[#e8b890]/25 bg-[#1a0e08]/75 px-6 py-5 shadow-2xl backdrop-blur-md sm:px-10 sm:py-7"
      >
        <div className="absolute -top-4 left-6 rounded-full bg-[#bf4e22]/95 px-4 py-1 text-sm font-medium shadow-lg ring-1 ring-[#f0c590]/30">
          {speaker}
        </div>
        <p className="min-h-[3.5rem] text-lg leading-relaxed text-white sm:text-xl">
          {shown}
          {!done && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
        </p>
        {done && (
          <div className="mt-2 text-right text-xs text-[#e8c8a8]/55">
            <span className="animate-pulse">▼ 點擊繼續</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
