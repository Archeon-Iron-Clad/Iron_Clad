import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPageToCanvas } from '../../lib/pdf/renderPageToCanvas'

type Props = {
  pdf: PDFDocumentProxy | null
  pageNumber: number
  scale?: number
}

export function PdfPageCanvas({ pdf, pageNumber, scale = 1.25 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!pdf || !canvas) return

    let cancelled = false

    void (async () => {
      try {
        await renderPageToCanvas(pdf, pageNumber, canvas, scale)
      } catch (e) {
        if (!cancelled) console.error('PDF render failed', e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pdf, pageNumber, scale])

  return <canvas ref={canvasRef} className="block max-h-[70vh] w-auto shadow-md" />
}
