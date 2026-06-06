import { useEffect, useRef, useState } from 'react'

export function useTypewriter(text: string, speedMs = 28) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const skipRef = useRef(false)

  useEffect(() => {
    skipRef.current = false
    if (!text) {
      setShown('')
      setDone(true)
      return
    }
    setShown('')
    setDone(false)
    let i = 0
    const id = window.setInterval(() => {
      if (skipRef.current) {
        setShown(text)
        setDone(true)
        window.clearInterval(id)
        return
      }
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) {
        setDone(true)
        window.clearInterval(id)
      }
    }, speedMs)
    return () => window.clearInterval(id)
  }, [text, speedMs])

  const skip = () => {
    skipRef.current = true
  }

  return { shown, done, skip }
}
