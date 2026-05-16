import { Icon } from '../../ui/Icon'

export function DashboardRightPanel() {
  return (
    <aside className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-l border-outline-variant bg-surface-bright">
      <div className="border-b border-outline-variant bg-surface-container-low p-4">
        <h3 className="text-base font-semibold">Collaboration</h3>
        <p className="text-xs text-on-surface-variant">3 Active Lawyers</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 flex items-center gap-3 border-l-4 border-secondary bg-secondary-container/10 px-4 py-2 font-bold text-secondary">
          <Icon name="history" />
          Activity
        </div>
        <div className="space-y-4 px-2">
          <FeedItem initials="AM" title="A. Miller redacted 12 PII instances" meta="2 mins ago • EX-10.4.pdf" />
          <FeedItem initials="SK" title="S. Kumar approved 5 conflicts" meta="15 mins ago • Deposition_A.txt" />
          <FeedItem initials="AI" title="AI SYSTEM batch processing complete" meta="45 mins ago • All Files" isAi />
        </div>
        <nav className="mt-6 space-y-1">
          <SideLink icon="group" label="Presence" />
          <SideLink icon="bolt" label="AI Queue" />
          <SideLink icon="forum" label="Chat" />
        </nav>
      </div>
    </aside>
  )
}

function FeedItem({
  initials,
  title,
  meta,
  isAi,
}: {
  initials: string
  title: string
  meta: string
  isAi?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          isAi ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high'
        }`}
      >
        {isAi ? <Icon name="bolt" size={14} /> : initials}
      </div>
      <div>
        <p className="text-xs font-semibold">{title}</p>
        <p className="text-[10px] uppercase text-on-surface-variant">{meta}</p>
      </div>
    </div>
  )
}

function SideLink({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high"
    >
      <Icon name={icon} />
      {label}
    </button>
  )
}
