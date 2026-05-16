/**
 * Coordinate convention: redaction rectangles are stored as fractions of the **rendered page**
 * width and height (top-left origin), each in [0, 1].
 *
 * When burning with pdf-lib, convert to PDF points using the page's media box size.
 */

export type NormalizedRect = { x: number; y: number; width: number; height: number }

export function pixelsToNormalized(
  rectPx: { left: number; top: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
): NormalizedRect {
  return {
    x: rectPx.left / canvasWidth,
    y: rectPx.top / canvasHeight,
    width: rectPx.width / canvasWidth,
    height: rectPx.height / canvasHeight,
  }
}

export function normalizedToPixelOverlay(n: NormalizedRect): {
  left: string
  top: string
  width: string
  height: string
} {
  return {
    left: `${n.x * 100}%`,
    top: `${n.y * 100}%`,
    width: `${n.width * 100}%`,
    height: `${n.height * 100}%`,
  }
}

/** Map normalized rect to pdf-lib coordinates (origin bottom-left). */
export function normalizedToPdfLibRect(
  n: NormalizedRect,
  pageWidthPts: number,
  pageHeightPts: number,
): { x: number; y: number; width: number; height: number } {
  const x = n.x * pageWidthPts
  const width = n.width * pageWidthPts
  const height = n.height * pageHeightPts
  const yTop = n.y * pageHeightPts
  const y = pageHeightPts - yTop - height
  return { x, y, width, height }
}
