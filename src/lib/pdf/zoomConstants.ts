export const SCALE_DEFAULT = 1.25
export const SCALE_MIN = 0.5
export const SCALE_MAX = 10
export const ZOOM_FACTOR = 1.15

export function clampScale(scale: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale))
}

export function zoomIn(scale: number): number {
  return clampScale(scale * ZOOM_FACTOR)
}

export function zoomOut(scale: number): number {
  return clampScale(scale / ZOOM_FACTOR)
}
