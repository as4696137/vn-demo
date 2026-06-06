import { motion } from 'framer-motion'

export function MainMenu({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#fbf5eb] via-[#f4e3c8] to-[#e4c8a2]">
      <motion.img
        src="/assets/logo.webp"
        alt="燃燒殆盡之前 — Before Burning Out"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="mb-12 w-[min(76vw,720px)] select-none drop-shadow-[0_8px_24px_rgba(150,70,30,0.18)]"
        draggable={false}
      />
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={onStart}
        className="rounded-full border border-[#bf4e22]/70 bg-white/40 px-12 py-3 text-lg tracking-[0.4em] text-[#5c3018] shadow-[0_4px_18px_rgba(150,70,30,0.15)] backdrop-blur-sm transition hover:border-[#a03a18] hover:bg-[#ffe0c4]/60 hover:text-[#3e1a08]"
      >
        開始
      </motion.button>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
        className="mt-16 text-xs tracking-[0.3em] text-[#8a4a26]/60"
      >
        a tiny visual novel
      </motion.p>
    </div>
  )
}
