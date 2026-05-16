import type { OverlayBox } from '../../pdf-viewer/RedactionOverlay'
import { CollaboratorList } from '../../presence/CollaboratorList'

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
        <h3 className="text-base font-semibold">Presence</h3>
        <p className="mt-1 text-xs text-on-surface-variant">
          {collaborators.length === 0
            ? 'No one else is viewing this document right now.'
            : `${collaborators.length} other ${collaborators.length === 1 ? 'viewer' : 'viewers'} on this PDF (heartbeat).`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Draft redactions
        </h4>
        {pending.length === 0 ? (
          <p className="text-xs text-on-surface-variant">No draft boxes on the open file.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((box) => (
              <li key={box.id} className="rounded border border-outline-variant bg-surface-container-low p-3">
                <p className="text-xs font-semibold text-on-surface">
                  Draft · Page {box.pageNumber ?? '—'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!onLockBox}
                    onClick={() => onLockBox?.(box.id)}
                    className="rounded bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-on-secondary disabled:opacity-40"
                  >
                    Lock
                  </button>
                  <button
                    type="button"
                    disabled={!onDeleteBox}
                    onClick={() => onDeleteBox?.(box.id)}
                    className="rounded border border-outline-variant px-2 py-1 text-[10px] font-bold uppercase disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-outline-variant bg-surface-container-low p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase text-on-surface-variant">Here now</h4>
        <CollaboratorList collaborators={collaborators} />
      </div>
    </aside>
  )
}
