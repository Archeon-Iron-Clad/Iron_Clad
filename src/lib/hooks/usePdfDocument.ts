import { startTransition, useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdfFromUrl } from '../pdf/renderPageToCanvas'

export function usePdfDocument(url: string | undefined) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) {
      startTransition(() => {
        setPdf(null)
        setError(null)
        setLoading(false)
      })
      return
    }

    let cancelled = false

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
    })

    loadPdfFromUrl(url)
      .then((doc) => {
        if (cancelled) return
        setPdf(doc)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setPdf(null)
        setError(e instanceof Error ? e : new Error(String(e)))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return { pdf, error, loading }
}
