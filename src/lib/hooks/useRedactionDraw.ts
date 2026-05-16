import { useCallback, useEffect, useRef, useState } from 'react'

export type DraftRect = { left: number; top: number; width: number; height: number }

/** Local drag state for drawing a box; synced to `draftRef` for synchronous read on pointer up. */
export function useRedactionDraw() {
  const [draft, setDraft] = useState<DraftRect | null>(null)
  const draftRef = useRef<DraftRect | null>(null)
  const drawing = useRef(false)
  const origin = useRef({ x: 0, y: 0 })

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const setDraftSynced = useCallback((next: DraftRect | null) => {
    draftRef.current = next
    setDraft(next)
  }, [])

  const onPointerDown = useCallback((x: number, y: number) => {
    drawing.current = true
    origin.current = { x, y }
    setDraftSynced({ left: x, top: y, width: 0, height: 0 })
  }, [setDraftSynced])

  const onPointerMove = useCallback((x: number, y: number) => {
    if (!drawing.current) return
    const o = origin.current
    setDraftSynced({
      left: Math.min(o.x, x),
      top: Math.min(o.y, y),
      width: Math.abs(x - o.x),
      height: Math.abs(y - o.y),
    })
  }, [setDraftSynced])

  const onPointerUp = useCallback((): DraftRect | null => {
    drawing.current = false
    return draftRef.current
  }, [])

  const clearDraft = useCallback(() => {
    setDraftSynced(null)
  }, [setDraftSynced])

  return { draft, onPointerDown, onPointerMove, onPointerUp, clearDraft }
}
