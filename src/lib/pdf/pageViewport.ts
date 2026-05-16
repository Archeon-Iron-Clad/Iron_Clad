import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { NormalizedRect } from './coordinateMap'
import { pixelsToNormalized } from './coordinateMap'

/**
 * Layout of a PDF page as rendered by PDF.js at a given scale.
 * Canvas intrinsic width/height match these values; stored redaction rects
 * are fractions of this viewport (top-left origin).
 */
export type PageViewportLayout = {
  width: number
  height: number
  scale: number
}

export async function getPageViewportLayout(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
): Promise<PageViewportLayout> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  return { width: viewport.width, height: viewport.height, scale }
}

/** Map viewport pixel rect → normalized [0,1] fractions of the PDF.js page viewport. */
export function viewportPixelsToNormalized(
  rectPx: { left: number; top: number; width: number; height: number },
  viewport: PageViewportLayout,
): NormalizedRect {
  return pixelsToNormalized(rectPx, viewport.width, viewport.height)
}

/**
 * Convert screen pointer position to viewport pixel coordinates,
 * accounting for CSS scaling of the canvas element.
 */
export function clientToViewportPixels(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  viewport: PageViewportLayout,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0 }
  }
  const x = ((clientX - rect.left) / rect.width) * viewport.width
  const y = ((clientY - rect.top) / rect.height) * viewport.height
  return {
    x: Math.max(0, Math.min(viewport.width, x)),
    y: Math.max(0, Math.min(viewport.height, y)),
  }
}

export function clampViewportRect(
  rect: { left: number; top: number; width: number; height: number },
  viewport: PageViewportLayout,
): { left: number; top: number; width: number; height: number } {
  const left = Math.max(0, Math.min(viewport.width, rect.left))
  const top = Math.max(0, Math.min(viewport.height, rect.top))
  const right = Math.max(left, Math.min(viewport.width, rect.left + rect.width))
  const bottom = Math.max(top, Math.min(viewport.height, rect.top + rect.height))
  return { left, top, width: right - left, height: bottom - top }
}
