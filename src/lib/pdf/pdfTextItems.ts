import { Util, type PDFDocumentProxy, type PDFPageProxy } from 'pdfjs-dist'

type PdfTextItem = {
  str: string
  transform: number[]
  width: number
  height: number
}

export type TextItemBounds = {
  index: number
  str: string
  left: number
  top: number
  width: number
  height: number
}

/** Text bounds in the same viewport pixel space as the rendered canvas at `scale`. */
export type PageTextData = {
  items: TextItemBounds[]
  pageWidth: number
  pageHeight: number
  scale: number
}

function isTextItem(item: { str?: string; type?: string }): item is PdfTextItem {
  return typeof item.str === 'string'
}

/** Map a PDF.js text item to viewport pixel bounds (top-left origin). */
export function textItemToBounds(
  item: PdfTextItem,
  index: number,
  viewport: { transform: number[]; scale: number },
): TextItemBounds {
  const t = Util.transform(viewport.transform, item.transform)
  const fontHeight = Math.hypot(item.transform[2], item.transform[3]) * viewport.scale
  const left = t[4]
  const top = t[5] - fontHeight
  const width = Math.max(item.width * viewport.scale, 1)
  const height = Math.max(fontHeight, 1)

  return { index, str: item.str, left, top, width, height }
}

/** Split a PDF text run into one bounds box per character (proportional widths). */
function expandToCharacterBounds(
  item: PdfTextItem,
  runIndex: number,
  viewport: { transform: number[]; scale: number },
): TextItemBounds[] {
  const text = item.str
  if (!text) return []

  const run = textItemToBounds(item, runIndex, viewport)
  const chars = [...text]
  if (chars.length === 1) return [run]

  const step = run.width / chars.length
  return chars.map((ch, i) => ({
    index: runIndex * 10_000 + i,
    str: ch,
    left: run.left + i * step,
    top: run.top,
    width: Math.max(step, 0.5),
    height: run.height,
  }))
}

export function sortReadingOrder(items: TextItemBounds[]): TextItemBounds[] {
  return [...items].sort((a, b) => {
    const dy = a.top - b.top
    if (Math.abs(dy) > 2) return dy
    return a.left - b.left
  })
}

export async function loadPageTextBounds(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<PageTextData> {
  const page: PDFPageProxy = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const content = await page.getTextContent()

  const items: TextItemBounds[] = []
  let i = 0
  for (const raw of content.items) {
    if (!isTextItem(raw) || raw.str.length === 0) continue
    items.push(...expandToCharacterBounds(raw, i++, viewport))
  }

  return {
    items,
    pageWidth: viewport.width,
    pageHeight: viewport.height,
    scale,
  }
}

export function rectsIntersect(
  a: { left: number; top: number; width: number; height: number },
  b: { left: number; top: number; width: number; height: number },
): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  )
}

export function pointInRect(
  x: number,
  y: number,
  r: { left: number; top: number; width: number; height: number },
): boolean {
  return x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height
}

/** Items whose bounds intersect the drag rectangle (viewport pixels). */
export function itemsInDragRect(
  items: TextItemBounds[],
  rect: { left: number; top: number; width: number; height: number },
): TextItemBounds[] {
  const norm = normalizeDragRect(rect)
  return items.filter((item) => rectsIntersect(item, norm))
}

/** Closest glyph to a point (for click-to-select). */
export function itemAtPoint(items: TextItemBounds[], x: number, y: number): TextItemBounds | null {
  let hit: TextItemBounds | null = null
  let bestDist = Infinity
  for (const item of items) {
    if (pointInRect(x, y, item)) {
      const cx = item.left + item.width / 2
      const cy = item.top + item.height / 2
      const d = (cx - x) ** 2 + (cy - y) ** 2
      if (d < bestDist) {
        bestDist = d
        hit = item
      }
    }
  }
  if (hit) return hit

  const sorted = sortReadingOrder(items)
  for (const item of sorted) {
    const cx = item.left + item.width / 2
    const cy = item.top + item.height / 2
    const d = (cx - x) ** 2 + (cy - y) ** 2
    if (d < bestDist) {
      bestDist = d
      hit = item
    }
  }
  return hit
}

function nearestItemIndex(sorted: TextItemBounds[], x: number, y: number): number {
  if (sorted.length === 0) return 0
  const hit = itemAtPoint(sorted, x, y)
  if (hit) {
    const idx = sorted.findIndex((item) => item.index === hit.index)
    if (idx >= 0) return idx
  }
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    const cx = item.left + item.width / 2
    const cy = item.top + item.height / 2
    const d = (cx - x) ** 2 + (cy - y) ** 2
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

/**
 * Select glyphs from anchor to focus in reading order (letter-by-letter drag).
 */
export function itemsInSelectionRange(
  items: TextItemBounds[],
  anchor: { x: number; y: number },
  focus: { x: number; y: number },
): TextItemBounds[] {
  if (items.length === 0) return []
  const sorted = sortReadingOrder(items)
  const a = nearestItemIndex(sorted, anchor.x, anchor.y)
  const b = nearestItemIndex(sorted, focus.x, focus.y)
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return sorted.slice(lo, hi + 1)
}

export function normalizeDragRect(rect: { left: number; top: number; width: number; height: number }) {
  return {
    left: rect.width < 0 ? rect.left + rect.width : rect.left,
    top: rect.height < 0 ? rect.top + rect.height : rect.top,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  }
}

/** Cluster selected glyphs into lines (similar vertical position), reading order. */
export function groupTextItemsByLine(items: TextItemBounds[]): TextItemBounds[][] {
  if (items.length === 0) return []

  const sorted = [...items].sort((a, b) => {
    const dy = a.top - b.top
    if (Math.abs(dy) > 1) return dy
    return a.left - b.left
  })

  const lines: TextItemBounds[][] = []
  let current: TextItemBounds[] = []
  let lineTop = sorted[0].top
  let lineHeight = sorted[0].height

  for (const item of sorted) {
    const threshold = Math.max(4, lineHeight * 0.55)
    if (current.length === 0) {
      current = [item]
      lineTop = item.top
      lineHeight = item.height
      continue
    }
    if (Math.abs(item.top - lineTop) <= threshold) {
      current.push(item)
      lineHeight = Math.max(lineHeight, item.height)
    } else {
      lines.push(current)
      current = [item]
      lineTop = item.top
      lineHeight = item.height
    }
  }
  if (current.length > 0) lines.push(current)
  return lines
}

export type HighlightRect = { left: number; top: number; width: number; height: number }

/**
 * Merge selected glyphs into a few contiguous highlight runs per line (for UI only).
 * Selection logic stays per-character; visuals look like normal text selection.
 */
export function mergeSelectionHighlightRects(items: TextItemBounds[]): HighlightRect[] {
  const rects: HighlightRect[] = []
  for (const line of groupTextItemsByLine(items)) {
    const sorted = [...line].sort((a, b) => a.left - b.left)
    let run: TextItemBounds[] = []
    for (const item of sorted) {
      if (run.length === 0) {
        run = [item]
        continue
      }
      const prev = run[run.length - 1]
      const gap = item.left - (prev.left + prev.width)
      const maxGap = Math.max(6, prev.height * 0.35)
      if (gap <= maxGap) {
        run.push(item)
      } else {
        const u = unionBounds(run)
        if (u) rects.push(u)
        run = [item]
      }
    }
    const u = unionBounds(run)
    if (u) rects.push(u)
  }
  return rects
}

/** One bounding box per line of selected text. */
export function lineBoundsFromSelection(
  items: TextItemBounds[],
): { left: number; top: number; width: number; height: number }[] {
  return groupTextItemsByLine(items)
    .map((lineItems) => unionBounds(lineItems))
    .filter((r): r is NonNullable<typeof r> => r !== null)
}

export function unionBounds(
  items: TextItemBounds[],
): { left: number; top: number; width: number; height: number } | null {
  if (items.length === 0) return null
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const item of items) {
    left = Math.min(left, item.left)
    top = Math.min(top, item.top)
    right = Math.max(right, item.left + item.width)
    bottom = Math.max(bottom, item.top + item.height)
  }
  return { left, top, width: right - left, height: bottom - top }
}
