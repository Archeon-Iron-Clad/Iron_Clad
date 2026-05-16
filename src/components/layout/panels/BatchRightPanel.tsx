import { Icon } from '../../ui/Icon'

export function BatchRightPanel() {
  return (
    <aside className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-l border-outline-variant bg-surface-bright p-4">
      <h3 className="mb-4 text-base font-semibold">Batch Actions</h3>
      <label className="mb-1 block text-xs font-semibold text-on-surface-variant">Bulk Exemption Code</label>
      <select className="mb-4 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm">
        <option>Select Code...</option>
        <option>Trade Secret</option>
        <option>Personal Privacy</option>
      </select>
      <button
        type="button"
        className="mb-6 w-full rounded bg-secondary-container py-2 text-xs font-bold text-on-secondary-container"
      >
        Apply to Selected
      </button>
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">Redaction Style</p>
      <div className="mb-6 flex gap-2">
        <button type="button" className="flex-1 rounded border-2 border-primary bg-primary py-3 text-xs font-bold text-on-primary">
          Solid
        </button>
        <button type="button" className="flex-1 rounded border-2 border-outline-variant py-3 text-xs font-bold">
          Outline
        </button>
      </div>
      <div className="mb-6 rounded border border-error-container bg-error-container/30 p-3 text-xs text-on-error-container">
        <p className="mb-2 font-semibold">Burning redactions is irreversible.</p>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded" />
          I confirm to proceed
        </label>
      </div>
      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded bg-error py-3 text-sm font-bold uppercase text-on-error"
      >
        <Icon name="local_fire_department" />
        Trigger Batch Burn
      </button>
    </aside>
  )
}
