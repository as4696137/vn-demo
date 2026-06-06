import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { EndingId } from '@/engine/types'

type Content = { main: string; small: string }

const CONTENT: Record<EndingId, Content> = {
  A: {
    main: '你知道邊界在哪了。這是某種開始。',
    small: '你上一次說「不」是什麼時候？',
  },
  B: {
    main: '你不知道前面是什麼。但你知道留在那裡是不對的。',
    small: '你有沒有一個一直沒說出口的決定？',
  },
  C: {
    main: '事情沒有一下子變好。但你說出來了。',
    small: '你身邊有沒有一個你一直想說但還沒說的人？',
  },
}

export function EndingScreen({ endingId }: { endingId: EndingId }) {
  const { main, small } = CONTENT[endingId]
  const toMenu = useGameStore((s) => s.toMenu)

  return (
    <div className="absolute inset-0 overflow-y-auto bg-black">
      <div className="mx-auto flex max-w-[480px] flex-col items-center px-6 pt-[40vh] pb-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-[1.5rem] leading-relaxed font-medium text-white"
        >
          {main}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 1.8 }}
          className="mt-8 text-[1rem] leading-relaxed font-normal text-white/60"
        >
          {small}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 4.3 }}
          className="mt-12 text-[0.85rem] leading-[1.8] text-white/45"
        >
          <p>職場倦怠不是你的問題，</p>
          <p>是你一個人在扛不應該一個人扛的重量。</p>
          <p className="mt-6">如果你或你身邊的人正在經歷類似的狀況——</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 5.3 }}
          className="mt-6 flex flex-col gap-2 text-[0.85rem]"
        >
          <a
            href="tel:1925"
            className="text-white/40 transition-colors duration-200 hover:text-white/80"
          >
            1925 安心專線 →
          </a>
          <a
            href="https://www.mohw.gov.tw/cp-88-70961-1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 transition-colors duration-200 hover:text-white/80"
          >
            衛福部心理健康資源 →
          </a>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 6.6 }}
          type="button"
          onClick={toMenu}
          className="mt-16 text-[0.75rem] tracking-[0.2em] text-white/25 transition-colors duration-200 hover:text-white/60"
        >
          重新開始
        </motion.button>
      </div>
    </div>
  )
}
