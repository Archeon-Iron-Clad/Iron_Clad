export type RedactionStatus = 'draft' | 'locked'

/** Normalized box: x, y, width, height are fractions of page width/height in [0, 1]. */
export type RedactionBoxInput = {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  status: RedactionStatus
}
