import { useCallback, useRef, useState } from 'react'

export type DraftRect = { left: number; top: number; width: number; height: number }

/** Local drag state for drawing a box; wire to Convex `createBox` in Phase 2. */
export function useRedactionDraw() {
  const [draft, setDraft] = useState<DraftRect | null>(null)
  const drawing = useRef(false)
  const origin = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((x: number, y: number) => {
    drawing.current = true
    origin.current = { x, y }
    setDraft({ left: x, top: y, width: 0, height: 0 })
  }, [])

  const onPointerMove = useCallback((x: number, y: number) => {
    if (!drawing.current) return
    const o = origin.current
    setDraft({
      left: Math.min(o.x, x),
      top: Math.min(o.y, y),
      width: Math.abs(x - o.x),
      height: Math.abs(y - o.y),
    })
  }, [])

  const onPointerUp = useCallback(() => {
    drawing.current = false
  }, [])

  const clearDraft = useCallback(() => setDraft(null), [])

  return { draft, onPointerDown, onPointerMove, onPointerUp, clearDraft }
}
