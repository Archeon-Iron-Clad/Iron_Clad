import type { OverlayBox } from '../../pdf-viewer/RedactionOverlay'
import { CollaboratorList } from '../../presence/CollaboratorList'
import { Icon } from '../../ui/Icon'

type Collaborator = { userId: string; displayName?: string; color?: string }

type Props = {
  collaborators: Collaborator[]
  draftBoxes: OverlayBox[]
  onLockBox?: (boxId: string) => void
  onDeleteBox?: (boxId: string) => void
}

export function WorkspaceRightPanel({
  collaborators,
  draftBoxes,
  onLockBox,
  onDeleteBox,
}: Props) {
  const pending = draftBoxes.filter((b) => b.status === 'draft')

  return (
    <aside className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-l border-outline-variant bg-surface-bright">
      <div className="border-b border-outline-variant p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Collaboration</h3>
          <p className="flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="size-1.5 rounded-full bg-green-500" />
            {collaborators.length} active {collaborators.length === 1 ? 'user' : 'users'}
          </p>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            <Icon name="bolt" className="text-secondary" size={18} />
            AI Queue
          </h3>
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-mono text-[10px]">
            {Math.max(pending.length, 8)} pending
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-secondary-container py-1.5 text-[11px] font-bold text-on-secondary-container"
          >
            Accept All
          </button>
          <button
            type="button"
            className="flex-1 rounded bg-surface-container-high py-1.5 text-[11px] font-bold text-on-surface"
          >
            Reject All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          <QueueItem label="SSN Detected" page="Page 4" excerpt='"...identifier 000-XX-7890..."' border="secondary" />
          <QueueItem label="Phone Number" page="Page 12" excerpt='"...(415) 555-..."' border="secondary" />
          <QueueItem label="Uncertain Match" page="Page 14" excerpt='"...Project Alpha..."' border="error" />
        </div>
        {pending.map((box) => (
          <div key={box.id} className="mt-2 rounded-sm border-l-4 border-secondary bg-surface-container-low p-3">
            <p className="text-xs font-semibold text-secondary">Draft • Page {box.pageNumber}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onLockBox?.(box.id)}
                className="rounded bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-on-secondary"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onDeleteBox?.(box.id)}
                className="rounded bg-outline-variant px-2 py-1 text-[10px] font-bold uppercase"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-outline-variant bg-surface-container-low p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase text-on-surface-variant">Here now</h4>
        <CollaboratorList collaborators={collaborators} />
        <h4 className="mb-2 mt-4 text-xs font-semibold uppercase text-on-surface-variant">Recent activity</h4>
        <ActivityRow name="John Doe" text="confirmed 12 redactions on Exhibit C" time="2 mins ago" />
        <ActivityRow name="Sarah K." text="added a conflict note on Page 12" time="15 mins ago" />
      </div>
    </aside>
  )
}

function QueueItem({
  label,
  page,
  excerpt,
  border,
}: {
  label: string
  page: string
  excerpt: string
  border: 'secondary' | 'error'
}) {
  return (
    <div
      className={`rounded-sm border-l-4 ${border === 'error' ? 'border-error' : 'border-secondary'} bg-surface-container-low p-3 hover:bg-surface-container-high`}
    >
      <div className="mb-1 flex justify-between">
        <span
          className={`text-xs font-semibold ${border === 'error' ? 'text-error' : 'text-secondary'}`}
        >
          {label}
        </span>
        <span className="font-mono text-[10px] text-on-surface-variant">{page}</span>
      </div>
      <p className="line-clamp-1 text-[11px] italic text-on-surface-variant">{excerpt}</p>
    </div>
  )
}

function ActivityRow({ name, text, time }: { name: string; text: string; time: string }) {
  return (
    <div className="mb-3 flex gap-3">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-surface-container-high text-[9px] font-bold">
        {name[0]}
      </div>
      <div>
        <p className="text-xs leading-tight">
          <strong>{name}</strong> {text}
        </p>
        <p className="text-[10px] text-on-surface-variant">{time}</p>
      </div>
    </div>
  )
}
