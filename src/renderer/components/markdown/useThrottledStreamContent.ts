import { useEffect, useRef, useState } from 'react'

/**
 * Chat streams arrive token-by-token, but every token does not need a full
 * markdown/KaTeX parse: a long answer with formulas re-parses its growing tail
 * dozens of times per second. Render at most once per interval while streaming,
 * always converging on the latest text with a trailing update, and let the
 * final (non-streaming) render use the exact content immediately.
 */
const DEFAULT_STREAM_RENDER_INTERVAL_MS = 100

export function useThrottledStreamContent(
  content: string,
  isStreaming: boolean,
  intervalMs = DEFAULT_STREAM_RENDER_INTERVAL_MS
): string {
  const [rendered, setRendered] = useState(content)
  const lastRenderAtRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef(content)

  pendingRef.current = content

  useEffect(() => {
    if (!isStreaming) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setRendered((previous) => (previous === content ? previous : content))
      return
    }

    const elapsed = performance.now() - lastRenderAtRef.current
    if (elapsed >= intervalMs) {
      lastRenderAtRef.current = performance.now()
      setRendered((previous) => (previous === content ? previous : content))
      return
    }

    if (timerRef.current !== null) return
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      lastRenderAtRef.current = performance.now()
      setRendered(pendingRef.current)
    }, intervalMs - elapsed)
  }, [content, intervalMs, isStreaming])

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    },
    []
  )

  return isStreaming ? rendered : content
}
