/**
 * Coordinate convention: redaction rectangles are stored as fractions of the
 * **PDF.js page viewport** at review time (top-left origin, each in [0, 1]).
 * The viewport width/height match the rendered canvas intrinsic dimensions
 * for that page and scale — see `pageViewport.ts`.
 *
 * When burning with pdf-lib, convert to PDF points using the page media box.
 */

export type NormalizedRect = { x: number; y: number; width: number; height: number }

/** @deprecated Prefer viewportPixelsToNormalized from pageViewport.ts */
export function pixelsToNormalized(
  rectPx: { left: number; top: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
): NormalizedRect {
  return {
    x: rectPx.left / viewportWidth,
    y: rectPx.top / viewportHeight,
    width: rectPx.width / viewportWidth,
    height: rectPx.height / viewportHeight,
  }
}

export function normalizedToPixels(
  n: NormalizedRect,
  viewportWidth: number,
  viewportHeight: number,
): { left: number; top: number; width: number; height: number } {
  return {
    left: n.x * viewportWidth,
    top: n.y * viewportHeight,
    width: n.width * viewportWidth,
    height: n.height * viewportHeight,
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
