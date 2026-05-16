import { Icon } from '../ui/Icon'

export type RedactionToolMode = 'marquee' | 'select-text' | 'move'

type ToolButtonProps = {
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
  danger?: boolean
  onClick: () => void
}

function ToolButton({ icon, label, active, disabled, danger, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-primary text-on-primary'
          : danger
            ? 'text-error hover:bg-error-container'
            : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
      <Icon name={icon} size={20} />
    </button>
  )
}

type Props = {
  mode: RedactionToolMode
  onModeChange: (mode: RedactionToolMode) => void
  canDraw: boolean
  hasSelectedBox: boolean
  onDelete?: () => void
}

export function RedactionToolbar({
  mode,
  onModeChange,
  canDraw,
  hasSelectedBox,
  onDelete,
}: Props) {
  if (!canDraw) return null

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-outline-variant bg-surface p-0.5"
      role="toolbar"
      aria-label="Redaction tools"
    >
      <ToolButton
        icon="crop_free"
        label="Marquee — drag to draw a redaction box"
        active={mode === 'marquee'}
        onClick={() => onModeChange('marquee')}
      />
      <ToolButton
        icon="text_fields"
        label="Select text — drag over text to redact"
        active={mode === 'select-text'}
        onClick={() => onModeChange('select-text')}
      />
      <ToolButton
        icon="open_with"
        label="Move — drag a selected box to reposition"
        active={mode === 'move'}
        onClick={() => onModeChange('move')}
      />
      <span className="mx-0.5 h-6 w-px bg-outline-variant" aria-hidden />
      <ToolButton
        icon="delete"
        label="Delete selected box"
        disabled={!hasSelectedBox || !onDelete}
        danger
        onClick={() => onDelete?.()}
      />
    </div>
  )
}
