import { useQuery } from 'convex/react'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Icon } from '../components/ui/Icon'

type Props = {
  sessionToken: string
  onOpenDocument: (id: Id<'documents'>) => void
}

/** Treat “conflicts” as documents that still have draft redaction boxes. */
export function ConflictsPage({ sessionToken, onOpenDocument }: Props) {
  const summary = useQuery(api.dashboard.summaryForUser, { sessionToken })

  if (!summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-on-surface-variant">
        Loading queue…
      </div>
    )
  }

  const queue = summary.documents.filter((d) => d.draftCount > 0)
  const pending = queue.length

  return (
    <div className="mx-auto min-h-full w-full max-w-4xl px-4 pb-10 pt-2 sm:px-6 lg:max-w-5xl lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Draft review queue</h2>
          <p className="text-sm text-on-surface-variant">
            Documents with at least one <strong>draft</strong> redaction box ({pending}{' '}
            {pending === 1 ? 'file' : 'files'} pending).
          </p>
        </div>
      </div>

      {pending === 0 ? (
        <article className="rounded-lg border border-dashed border-outline-variant bg-surface p-10 text-center">
          <Icon name="check_circle" className="mx-auto mb-3 text-secondary" size={40} />
          <p className="text-lg font-semibold text-on-surface">No open draft conflicts</p>
          <p className="mt-2 max-w-md text-sm text-on-surface-variant">
            Either all boxes are locked for your accessible documents, or you have not drawn any redactions yet. Open the
            Workspace to add boxes.
          </p>
        </article>
      ) : (
        <ul className="space-y-3">
          {queue.map((doc) => (
            <li
              key={doc.documentId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface px-4 py-3"
            >
              <div>
                <span className="rounded bg-error-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-error-container">
                  Draft pending
                </span>
                <p className="mt-2 text-sm font-semibold text-on-surface">{doc.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {doc.draftCount} draft · {doc.lockedCount} locked — open in Workspace to lock or edit your own boxes.
                </p>
              </div>
              <button
                type="button"
                className="rounded border border-secondary bg-secondary-container px-4 py-2 text-xs font-semibold text-on-secondary-container"
                onClick={() => onOpenDocument(doc.documentId as Id<'documents'>)}
              >
                Resolve in Workspace
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
