import { Icon } from '../ui/Icon'

type Props = {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: Props) {
  return (
    <div className="pointer-events-auto fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-outline-variant bg-surface-container-highest p-1 shadow-lg">
      <button
        type="button"
        onClick={onZoomOut}
        className="rounded-full p-2 hover:bg-surface-container-low"
        aria-label="Zoom out"
      >
        <Icon name="remove" />
      </button>
      <span className="px-4 text-xs font-semibold">{Math.round(scale * 100)}%</span>
      <button
        type="button"
        onClick={onZoomIn}
        className="rounded-full p-2 hover:bg-surface-container-low"
        aria-label="Zoom in"
      >
        <Icon name="add" />
      </button>
      <div className="mx-1 h-4 w-px bg-outline-variant" />
      <button
        type="button"
        onClick={onReset}
        className="rounded-full p-2 hover:bg-surface-container-low"
        aria-label="Fit screen"
      >
        <Icon name="fit_screen" />
      </button>
    </div>
  )
}
