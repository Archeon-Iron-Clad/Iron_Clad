import * as pdfjs from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import { setupPdfWorker } from './setupPdfWorker'
import type { PageRedactions, RedactionExportBox } from './exportVisualRedactionPreview'

setupPdfWorker()

/** Higher scale = sharper rasterized release pages. */
const RELEASE_RASTER_SCALE = 2
const MIN_BOX_PX = 4

export type { PageRedactions }

async function loadPdfFromBytes(bytes: ArrayBuffer): Promise<pdfjs.PDFDocumentProxy> {
  return pdfjs.getDocument({ data: bytes.slice(0) }).promise
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode page image'))
          return
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
      },
      'image/png',
      1,
    )
  })
}

/**
 * Rasterize a page to PNG with redaction regions burned into pixels.
 * The resulting page has no text layer — content cannot be copy-pasted out.
 */
async function rasterizePageWithRedactions(
  pdf: pdfjs.PDFDocumentProxy,
  pageIndex: number,
  boxes: RedactionExportBox[],
): Promise<{ pngBytes: Uint8Array; widthPts: number; heightPts: number }> {
  const page = await pdf.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: RELEASE_RASTER_SCALE })
  const sizePts = page.getViewport({ scale: 1 })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  const task = page.render({ canvasContext: ctx, viewport, canvas })
  await task.promise

  ctx.fillStyle = '#000000'
  for (const box of boxes) {
    const left = box.x * viewport.width
    const top = box.y * viewport.height
    const w = box.width * viewport.width
    const h = box.height * viewport.height
    if (w < MIN_BOX_PX || h < MIN_BOX_PX) continue
    ctx.fillRect(left, top, w, h)
  }

  const pngBytes = await canvasToPngBytes(canvas)
  return {
    pngBytes,
    widthPts: sizePts.width,
    heightPts: sizePts.height,
  }
}

function stripDocumentMetadata(doc: PDFDocument): void {
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setProducer('Iron Clad')
  doc.setCreator('Iron Clad')
}

/**
 * Release export: pages with redactions are flattened to images (no extractable text
 * under redacted regions). Clean pages are copied from the source. Metadata is cleared.
 */
export async function exportReleaseRedactedPdf(
  originalPdfBytes: ArrayBuffer,
  byPage: PageRedactions[],
): Promise<Uint8Array> {
  const pdfjsDoc = await loadPdfFromBytes(originalPdfBytes)
  const srcDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true })
  const outDoc = await PDFDocument.create()

  const boxesByPage = new Map<number, RedactionExportBox[]>()
  for (const { pageIndex, boxes } of byPage) {
    if (boxes.length > 0) boxesByPage.set(pageIndex, boxes)
  }

  const pageCount = pdfjsDoc.numPages

  try {
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const boxes = boxesByPage.get(pageIndex)
      if (boxes && boxes.length > 0) {
        const { pngBytes, widthPts, heightPts } = await rasterizePageWithRedactions(
          pdfjsDoc,
          pageIndex,
          boxes,
        )
        const image = await outDoc.embedPng(pngBytes)
        const page = outDoc.addPage([widthPts, heightPts])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: widthPts,
          height: heightPts,
        })
      } else {
        const [copied] = await outDoc.copyPages(srcDoc, [pageIndex])
        outDoc.addPage(copied)
      }
    }
  } finally {
    void pdfjsDoc.destroy()
  }

  stripDocumentMetadata(outDoc)
  return outDoc.save()
}
