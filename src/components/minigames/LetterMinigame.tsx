import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { playSe } from '@/engine/audio'
import type { MinigameProps } from './types'

/**
 * Letter mini-game
 *
 * Choice mapping（劇本選項順序要跟這個對齊）：
 *   index 0 → 折起來，放回去（拖紙往上、超過 fold 閾值觸發）
 *   index 1 → 坐下來把它讀完（在紙上「乾淨地點一下」觸發，拖過就不算）
 *
 * 互動規則：
 *   - 拖到一半（沒超過閾值）放開 → snap 回原位，不選任何動作
 *   - 拖到底（超過閾值）放開 → 折起來
 *   - 完全沒拖、單純點擊 → 閱讀
 */

type Phase = 'idle' | 'folding' | 'reading'

const FOLD_THRESHOLD_PX = -180 // 需要明確的長距離才算「拖到底」
const FOLD_ANIM_MS = 650
const READ_ANIM_MS = 700

export function LetterMinigame({ onChoose }: MinigameProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [showHint, setShowHint] = useState(false)
  // 這一輪 pointer down → up 期間，有沒有發生過 drag。
  // pointer down 時 reset，drag start 時 set，tap callback 用它過濾掉「拖完才放開」誤觸。
  const draggedThisGestureRef = useRef(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowHint(true), 3000)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase === 'idle') return
    const ms = phase === 'folding' ? FOLD_ANIM_MS : READ_ANIM_MS
    const t = window.setTimeout(() => {
      onChoose(phase === 'folding' ? 0 : 1)
    }, ms)
    return () => window.clearTimeout(t)
  }, [phase, onChoose])

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
      <AnimatePresence>
        {phase !== 'folding' && (
          <motion.div
            key="paper"
            drag={phase === 'idle' ? 'y' : false}
            dragSnapToOrigin
            dragConstraints={{ top: -340, bottom: 24 }}
            dragElastic={0.18}
            dragTransition={{ bounceStiffness: 320, bounceDamping: 26 }}
            onPointerDown={() => {
              draggedThisGestureRef.current = false
            }}
            onDragStart={() => {
              draggedThisGestureRef.current = true
            }}
            onDragEnd={(_, info) => {
              if (phase !== 'idle') return
              if (info.offset.y < FOLD_THRESHOLD_PX) {
                playSe('paper_fold')
                setPhase('folding')
              }
              // 否則：dragSnapToOrigin 會自動把紙拉回原位，這裡什麼都不做
            }}
            onTap={() => {
              if (phase !== 'idle') return
              if (draggedThisGestureRef.current) return // 這次手勢拖過，不算「乾淨點擊」
              playSe('paper_unfold')
              setPhase('reading')
            }}
            initial={{ opacity: 0, y: 36, rotate: -1.5, scale: 0.95 }}
            animate={
              phase === 'reading'
                ? {
                    opacity: 0,
                    scale: 1.08,
                    rotate: 0,
                    transition: { duration: READ_ANIM_MS / 1000, ease: 'easeOut' },
                  }
                : {
                    opacity: 1,
                    rotate: -1.5,
                    scale: 1,
                    transition: { duration: 0.55, ease: 'easeOut' },
                  }
            }
            exit={{
              opacity: 0,
              scaleY: 0.12,
              rotate: 6,
              transition: { duration: FOLD_ANIM_MS / 1000, ease: 'easeIn' },
            }}
            whileHover={phase === 'idle' ? { scale: 1.015 } : undefined}
            whileDrag={{ rotate: -2.5, cursor: 'grabbing' }}
            style={{
              touchAction: 'none',
              aspectRatio: '3 / 4',
              transformOrigin: 'center top',
            }}
            className="relative w-[min(78vw,420px)] cursor-grab select-none active:cursor-grabbing"
          >
            <Paper />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && phase === 'idle' && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="pointer-events-none absolute right-0 bottom-12 left-0 text-center text-xs tracking-wider text-white/45"
          >
            <p>↑ 向上拖，把它折回去</p>
            <p className="mt-1.5">輕點，坐下來把它讀完</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Paper() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-sm bg-[#f7eed5] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(140,100,40,0.08)]">
      {/* paper grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'repeating-linear-gradient(135deg, transparent 0 6px, rgba(150,110,60,0.04) 6px 7px)',
        }}
      />
      {/* left margin line */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-[#c79468]/25" />
      {/* top/bottom faint shadows for depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#caa274]/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#caa274]/20 to-transparent" />

      <div
        className="relative flex h-full flex-col px-10 py-10"
        style={{ fontFamily: '"Noto Serif TC", "Songti TC", "PingFang TC", serif' }}
      >
        <p className="mb-2 text-xl font-medium tracking-wider text-[#3a2818]">
          入職第一天的期望
        </p>
        <p className="mb-8 text-[0.7rem] tracking-[0.2em] text-[#7a5a36]/70">
          2024 . 04 . 01
        </p>

        <p className="text-[15px] leading-[2] text-[#3a2818]">
          我希望做出讓人記得的作品。
        </p>
        <p className="mt-3 text-[15px] leading-[2] text-[#3a2818]">
          我希望每天早上起來，有一點點期待。
        </p>

        <div className="mt-auto text-right text-[0.7rem] tracking-wider text-[#7a5a36]/55">
          ⸺ 簽於入職當天
        </div>
      </div>
    </div>
  )
}
