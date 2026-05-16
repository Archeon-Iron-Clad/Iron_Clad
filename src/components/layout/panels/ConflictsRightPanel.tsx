import { Icon } from '../../ui/Icon'

export function ConflictsRightPanel() {
  return (
    <aside className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-l border-outline-variant bg-surface-bright">
      <div className="border-b border-outline-variant bg-surface p-4">
        <h3 className="text-base font-semibold">Collaboration</h3>
        <p className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="size-2 rounded-full bg-secondary" />
          3 ACTIVE LAWYERS
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Live Activity
        </h4>
        <div className="space-y-6">
          <LiveItem icon="history" title="Associate Miller" desc="Flagged Conflict #01" time="4 min ago" />
          <LiveItem icon="bolt" title="AI Optimizer" desc="Processed Document Batch 04" time="12 min ago" />
          <LiveItem icon="group" title="Partner Stevens" desc="Joined the review session" time="15 min ago" filled />
        </div>
        <div className="mt-8 border-t border-outline-variant px-0 py-6">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="forum" />
            <span className="text-xs font-bold uppercase">Case Chat</span>
          </div>
          <div className="mb-4 rounded bg-surface-container-low p-3 text-xs">
            <span className="font-bold">Stevens:</span> We need to be aggressive with the NovaTech
            redactions. Exemption 4 applies throughout.
          </div>
          <input
            type="text"
            placeholder="Post internal memo..."
            className="w-full rounded border border-outline bg-surface p-2 text-xs focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>
      </div>
      <div className="border-t border-outline-variant bg-surface p-4">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Icon name="bolt" />
          <span className="text-xs font-semibold">
            AI Queue: <span className="text-secondary">128 Docs</span>
          </span>
        </div>
      </div>
    </aside>
  )
}

function LiveItem({
  icon,
  title,
  desc,
  time,
  filled,
}: {
  icon: string
  title: string
  desc: string
  time: string
  filled?: boolean
}) {
  return (
    <div className="flex gap-3">
      <Icon name={icon} className="mt-0.5 text-secondary" filled={filled} />
      <div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-[11px] text-on-surface-variant">{desc}</p>
        <span className="text-[10px] text-on-surface-variant">{time}</span>
      </div>
    </div>
  )
}
