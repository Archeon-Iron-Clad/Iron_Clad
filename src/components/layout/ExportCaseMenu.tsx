import { useRef, useState } from 'react'
import { Icon } from '../ui/Icon'

type Props = {
  onPreviewExport: () => void
  onReleaseExport: () => void
  disabled?: boolean
}

export function ExportCaseMenu({ onPreviewExport, onReleaseExport, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded border border-primary bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Export
        <Icon name="expand_more" size={16} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close export menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 w-64 rounded border border-outline-variant bg-surface-bright py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-xs hover:bg-surface-container-high"
              onClick={() => {
                setOpen(false)
                onPreviewExport()
              }}
            >
              <span className="font-semibold text-on-surface">Preview PDF</span>
              <span className="mt-0.5 block text-on-surface-variant">
                Black rectangles for reading — text may still be extractable
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-xs hover:bg-surface-container-high"
              onClick={() => {
                setOpen(false)
                onReleaseExport()
              }}
            >
              <span className="font-semibold text-on-surface">Release PDF</span>
              <span className="mt-0.5 block text-on-surface-variant">
                Flattens only redacted regions to images — rest stays selectable text
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
