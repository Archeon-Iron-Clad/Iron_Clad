import { useState } from 'react'
import { usePdfDocument } from '../../lib/hooks/usePdfDocument'
import { PdfPageCanvas } from './PdfPageCanvas'
import { PageNavigator } from './PageNavigator'
import { RedactionOverlay } from './RedactionOverlay'

type Props = {
  pdfUrl: string | undefined
}

export function PdfViewer({ pdfUrl }: Props) {
  const { pdf, error, loading } = usePdfDocument(pdfUrl)
  const [page, setPage] = useState(1)

  const totalPages = pdf?.numPages ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PageNavigator
          page={page}
          totalPages={totalPages}
          onChange={(p) => setPage(Math.min(Math.max(1, p), Math.max(1, totalPages)))}
        />
        {loading && <span className="text-sm text-zinc-500">Loading PDF…</span>}
        {error && <span className="text-sm text-red-600">{error.message}</span>}
      </div>

      <div className="overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="relative inline-block">
          <PdfPageCanvas pdf={pdf} pageNumber={page} />
          <RedactionOverlay boxes={[]} />
        </div>
      </div>
    </div>
  )
}
