import * as pdfjs from 'pdfjs-dist'
import { PDFDocument, rgb } from 'pdf-lib'
import { normalizedToPdfLibRect } from './coordinateMap'
import { setupPdfWorker } from './setupPdfWorker'
import type { PageRedactions, RedactionExportBox } from './exportVisualRedactionPreview'

setupPdfWorker()

/** Higher scale = sharper redaction patch images. */
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
          reject(new Error('Failed to encode redaction patch'))
          return
        }
        void blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
      },
      'image/png',
      1,
    )
  })
}

async function renderPageToCanvas(
  pdf: pdfjs.PDFDocumentProxy,
  pageIndex: number,
): Promise<{
  canvas: HTMLCanvasElement
  viewportWidth: number
  viewportHeight: number
  widthPts: number
  heightPts: number
}> {
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

  return {
    canvas,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    widthPts: sizePts.width,
    heightPts: sizePts.height,
  }
}

/**
 * Burn each redaction region to a small PNG patch and place it on the page.
 * The rest of the page stays vector/text from the source PDF.
 */
async function applyRedactionPatches(
  outDoc: PDFDocument,
  outPage: ReturnType<PDFDocument['addPage']>,
  sourceCanvas: HTMLCanvasElement,
  viewportWidth: number,
  viewportHeight: number,
  boxes: RedactionExportBox[],
  pageWidthPts: number,
  pageHeightPts: number,
): Promise<void> {
  for (const box of boxes) {
    const left = Math.floor(box.x * viewportWidth)
    const top = Math.floor(box.y * viewportHeight)
    const w = Math.floor(box.width * viewportWidth)
    const h = Math.floor(box.height * viewportHeight)
    if (w < MIN_BOX_PX || h < MIN_BOX_PX) continue

    const crop = document.createElement('canvas')
    crop.width = w
    crop.height = h
    const cropCtx = crop.getContext('2d')
    if (!cropCtx) continue

    cropCtx.drawImage(sourceCanvas, left, top, w, h, 0, 0, w, h)
    cropCtx.fillStyle = '#000000'
    cropCtx.fillRect(0, 0, w, h)

    const pngBytes = await canvasToPngBytes(crop)
    const image = await outDoc.embedPng(pngBytes)
    const r = normalizedToPdfLibRect(box, pageWidthPts, pageHeightPts)

    outPage.drawRectangle({
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      color: rgb(0, 0, 0),
    })
    outPage.drawImage(image, {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
    })
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
 * Release export: only redacted regions are flattened to image patches.
 * Unredacted page content remains selectable/copyable from the source PDF.
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
        const { canvas, viewportWidth, viewportHeight, widthPts, heightPts } =
          await renderPageToCanvas(pdfjsDoc, pageIndex)
        const [copied] = await outDoc.copyPages(srcDoc, [pageIndex])
        const outPage = outDoc.addPage(copied)
        await applyRedactionPatches(
          outDoc,
          outPage,
          canvas,
          viewportWidth,
          viewportHeight,
          boxes,
          widthPts,
          heightPts,
        )
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
