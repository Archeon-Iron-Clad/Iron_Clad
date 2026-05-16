import { useMemo } from 'react'
import { mergeSelectionHighlightRects, type TextItemBounds } from '../../lib/pdf/pdfTextItems'

type Props = {
  items: TextItemBounds[]
}

export function TextSelectionPreview({ items }: Props) {
  const rects = useMemo(() => mergeSelectionHighlightRects(items), [items])

  if (rects.length === 0) return null

  return (
    <>
      {rects.map((r, i) => (
        <div
          key={`${r.left}-${r.top}-${i}`}
          className="pointer-events-none absolute z-[11] rounded-[2px] bg-secondary/30"
          style={{
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
          }}
        />
      ))}
    </>
  )
}
