import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { PageViewportLayout } from '../../lib/pdf/pageViewport'
import { renderPageToCanvas } from '../../lib/pdf/renderPageToCanvas'

export type PageCanvasLayout = PageViewportLayout

type Props = {
  pdf: PDFDocumentProxy | null
  pageNumber: number
  scale?: number
  onLayoutReady?: (layout: PageCanvasLayout) => void
}

export const PdfPageCanvas = forwardRef<HTMLCanvasElement, Props>(function PdfPageCanvas(
  { pdf, pageNumber, scale = 1.25, onLayoutReady },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderGenRef = useRef(0)

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!pdf || !canvas) return

    const gen = ++renderGenRef.current
    let cancelled = false
    let handle: ReturnType<typeof renderPageToCanvas> | null = null

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    canvas.width = 0
    canvas.height = 0

    handle = renderPageToCanvas(pdf, pageNumber, canvas, scale)

    void handle.promise
      .then(() => {
        if (cancelled || gen !== renderGenRef.current) return
        onLayoutReady?.({
          width: canvas.width,
          height: canvas.height,
          scale,
        })
      })
      .catch((e) => {
        if (cancelled) return
        if ((e as { name?: string })?.name === 'RenderingCancelledException') return
        console.error('PDF render failed', e)
      })

    return () => {
      cancelled = true
      handle?.cancel()
    }
  }, [pdf, pageNumber, scale, onLayoutReady])

  return <canvas ref={canvasRef} className="block h-full w-full shadow-md" />
})
