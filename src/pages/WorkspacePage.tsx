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
  onUpdateExemption?: (boxId: string, exemptionCodeId: string | null) => void | Promise<void>
  onMoveBox?: (
    boxId: string,
    rect: { x: number; y: number; width: number; height: number },
  ) => void | Promise<void>
  onDeleteBox?: (boxId: string) => void | Promise<void>
  canPersist?: boolean
  emptyAction?: ReactNode
}

export function WorkspacePage({
  pdfUrl,
  boxes,
  onCreateBox,
  onUpdateExemption,
  onMoveBox,
  onDeleteBox,
  canPersist,
  emptyAction,
}: Props) {
  return (
    <PdfViewer
      pdfUrl={pdfUrl}
      boxes={boxes}
      onCreateBox={onCreateBox}
      onUpdateExemption={onUpdateExemption}
      onMoveBox={onMoveBox}
      onDeleteBox={onDeleteBox}
      canPersist={canPersist}
      emptyAction={emptyAction}
    />
  )
}
