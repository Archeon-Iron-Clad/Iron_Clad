import { PDFDocument, rgb } from 'pdf-lib'
import type { NormalizedRect } from './coordinateMap'
import { normalizedToPdfLibRect } from './coordinateMap'

export type PageRedactions = { pageIndex: number; boxes: NormalizedRect[] }

/** Load original PDF bytes and draw black rectangles for each normalized box. */
export async function exportRedactedPdf(
  originalPdfBytes: ArrayBuffer,
  byPage: PageRedactions[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true })

  for (const { pageIndex, boxes } of byPage) {
    const page = doc.getPage(pageIndex)
    const { width, height } = page.getSize()
    for (const box of boxes) {
      const r = normalizedToPdfLibRect(box, width, height)
      page.drawRectangle({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        color: rgb(0, 0, 0),
      })
    }
  }

  return doc.save()
}
