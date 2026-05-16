import * as pdfjs from 'pdfjs-dist'
import { setupPdfWorker } from './setupPdfWorker'

setupPdfWorker()

export async function loadPdfFromUrl(url: string): Promise<pdfjs.PDFDocumentProxy> {
  const task = pdfjs.getDocument({ url })
  return task.promise
}

export async function renderPageToCanvas(
  pdf: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.25,
): Promise<void> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: ctx, viewport, canvas }).promise
}
