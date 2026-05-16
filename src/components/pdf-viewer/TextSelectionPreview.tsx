import type { TextItemBounds } from '../../lib/pdf/pdfTextItems'

type Props = {
  items: TextItemBounds[]
  dragRect: { left: number; top: number; width: number; height: number } | null
}

export function TextSelectionPreview({ items, dragRect }: Props) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.index}
          className="pointer-events-none absolute z-[3] rounded-sm bg-secondary/30 outline outline-1 outline-secondary"
          style={{
            left: item.left,
            top: item.top,
            width: item.width,
            height: item.height,
          }}
        />
      ))}
      {dragRect && (Math.abs(dragRect.width) > 2 || Math.abs(dragRect.height) > 2) && (
        <div
          className="pointer-events-none absolute z-[2] border border-dashed border-secondary/70 bg-secondary/10"
          style={{
            left: dragRect.width < 0 ? dragRect.left + dragRect.width : dragRect.left,
            top: dragRect.height < 0 ? dragRect.top + dragRect.height : dragRect.top,
            width: Math.abs(dragRect.width),
            height: Math.abs(dragRect.height),
          }}
        />
      )}
    </>
  )
}
