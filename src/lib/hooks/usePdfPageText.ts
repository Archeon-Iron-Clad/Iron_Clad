import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPageTextBounds, type PageTextData } from '../pdf/pdfTextItems'

export function usePdfPageText(
  pdf: PDFDocumentProxy | null,
  pageNumber: number,
  scale: number,
) {
  const [data, setData] = useState<PageTextData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!pdf) {
      setData(null)
      return
    }

    let cancelled = false
    setLoading(true)

    void loadPageTextBounds(pdf, pageNumber, scale)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('Failed to load page text', e)
          setData({ items: [], pageWidth: 0, pageHeight: 0, scale })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pdf, pageNumber, scale])

  return { textData: data, textLoading: loading }
}
