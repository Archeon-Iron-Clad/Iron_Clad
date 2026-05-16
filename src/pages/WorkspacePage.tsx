import type { ReactNode } from 'react'
import { PdfViewer } from '../components/pdf-viewer/PdfViewer'
import type { OverlayBox } from '../components/pdf-viewer/RedactionOverlay'

type Props = {
  pdfUrl: string | undefined
  boxes: OverlayBox[]
  onCreateBox?: (
    pageNumber: number,
    rect: { x: number; y: number; width: number; height: number },
  ) => void
  emptyAction?: ReactNode
}

export function WorkspacePage({ pdfUrl, boxes, onCreateBox, emptyAction }: Props) {
  return <PdfViewer pdfUrl={pdfUrl} boxes={boxes} onCreateBox={onCreateBox} emptyAction={emptyAction} />
}
