import { useCallback, useRef, useState } from 'react'
import { pixelsToNormalized } from '../../lib/pdf/coordinateMap'
import { usePdfDocument } from '../../lib/hooks/usePdfDocument'
import { useRedactionDraw } from '../../lib/hooks/useRedactionDraw'
import { Icon } from '../ui/Icon'
import { PageNavigator } from './PageNavigator'
import { PdfPageCanvas } from './PdfPageCanvas'
import { RedactionOverlay, type OverlayBox } from './RedactionOverlay'
import { ZoomControls } from './ZoomControls'

type Props = {
  pdfUrl: string | undefined
  boxes?: OverlayBox[]
  onCreateBox?: (pageNumber: number, rect: { x: number; y: number; width: number; height: number }) => void
}

const MIN_BOX_PX = 8

export function PdfViewer({ pdfUrl, boxes = [], onCreateBox }: Props) {
  const { pdf, error, loading } = usePdfDocument(pdfUrl)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.25)

  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const { draft, onPointerDown, onPointerMove, onPointerUp, clearDraft } = useRedactionDraw()

  const totalPages = pdf?.numPages ?? 0

  const clientToLocal = useCallback((clientX: number, clientY: number) => {
    const wrap = canvasWrapRef.current
    if (!wrap) return null
    const rect = wrap.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const finishDraw = useCallback(() => {
    onPointerUp()
    if (!draft || !onCreateBox) {
      clearDraft()
      return
    }
    const wrap = canvasWrapRef.current
    if (!wrap) {
      clearDraft()
      return
    }
    const { width, height } = wrap.getBoundingClientRect()
    if (draft.width < MIN_BOX_PX || draft.height < MIN_BOX_PX) {
      clearDraft()
      return
    }
    const normalized = pixelsToNormalized(draft, width, height)
    onCreateBox(page, normalized)
    clearDraft()
  }, [clearDraft, draft, onCreateBox, onPointerUp, page])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onCreateBox) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = clientToLocal(e.clientX, e.clientY)
    if (pt) onPointerDown(pt.x, pt.y)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const pt = clientToLocal(e.clientX, e.clientY)
    if (pt) onPointerMove(pt.x, pt.y)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Document workspace</h2>
          <p className="text-sm text-on-surface-variant">
            Draw redaction boxes on the PDF • {totalPages > 0 ? `${totalPages} pages` : 'No document'}
          </p>
        </div>
        <PageNavigator
          page={page}
          totalPages={totalPages}
          onChange={(p) => setPage(Math.min(Math.max(1, p), Math.max(1, totalPages)))}
        />
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading PDF…</p>}
      {error && <p className="text-sm text-error">{error.message}</p>}

      {!pdfUrl && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-outline-variant bg-surface p-12 text-center">
          <Icon name="picture_as_pdf" className="text-on-surface-variant" size={48} />
          <p className="max-w-sm text-sm text-on-surface-variant">
            Upload a PDF from the sidebar. When Convex is configured, picks sync across your accessible documents.
          </p>
        </div>
      )}

      {pdfUrl && (
        <div className="flex flex-1 justify-center overflow-auto pb-16">
          <div
            ref={canvasWrapRef}
            className="relative inline-block cursor-crosshair bg-white shadow-md"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDraw}
            onPointerCancel={finishDraw}
          >
            <PdfPageCanvas pdf={pdf} pageNumber={page} scale={scale} />
            <RedactionOverlay boxes={boxes} currentPage={page} />
            {draft && (
              <div
                className="redaction-suggested pointer-events-none absolute box-border rounded-sm"
                style={{
                  left: draft.left,
                  top: draft.top,
                  width: draft.width,
                  height: draft.height,
                }}
              />
            )}
          </div>
        </div>
      )}

      {pdfUrl && (
        <ZoomControls
          scale={scale}
          onZoomIn={() => setScale(Math.min(scale + 0.15, 3))}
          onZoomOut={() => setScale(Math.max(scale - 0.15, 0.5))}
          onReset={() => setScale(1.25)}
        />
      )}
    </div>
  )
}
