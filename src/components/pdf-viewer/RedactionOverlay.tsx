import type { NormalizedRect } from '../../lib/pdf/coordinateMap'
import { normalizedToPixelOverlay } from '../../lib/pdf/coordinateMap'

export type OverlayBox = NormalizedRect & { id: string; status: 'draft' | 'locked'; userId: string }

type Props = {
  boxes: OverlayBox[]
}

export function RedactionOverlay({ boxes }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {boxes.map((box) => {
        const style = normalizedToPixelOverlay(box)
        const locked = box.status === 'locked'
        return (
          <div
            key={box.id}
            className={`absolute box-border border-2 ${locked ? 'border-amber-500/80' : 'border-red-500/80'}`}
            style={{
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              backgroundColor: 'rgba(0,0,0,0.35)',
            }}
          />
        )
      })}
    </div>
  )
}
