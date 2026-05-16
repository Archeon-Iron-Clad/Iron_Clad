import * as pdfjs from 'pdfjs-dist'
import type { RenderTask } from 'pdfjs-dist'
import { setupPdfWorker } from './setupPdfWorker'

setupPdfWorker()

export async function loadPdfFromUrl(url: string): Promise<pdfjs.PDFDocumentProxy> {
  const task = pdfjs.getDocument({ url })
  return task.promise
}

export type PageRenderHandle = {
  promise: Promise<void>
  cancel: () => void
}

/** Render a PDF page; cancel any in-flight task before starting a new one. */
export function renderPageToCanvas(
  pdf: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.25,
): PageRenderHandle {
  let task: RenderTask | null = null

  const promise = (async () => {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas context unavailable')

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.width = viewport.width
    canvas.height = viewport.height

    task = page.render({ canvasContext: ctx, viewport, canvas })
    await task.promise
  })()

  return {
    promise,
    cancel: () => {
      task?.cancel()
    },
  }
}
