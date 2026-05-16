import { useQuery } from 'convex/react'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Icon } from '../components/ui/Icon'

type Props = {
  sessionToken: string
  onOpenDocument: (id: Id<'documents'>) => void
}

export function DashboardPage({ sessionToken, onOpenDocument }: Props) {
  const summary = useQuery(api.dashboard.summaryForUser, { sessionToken })

  if (!summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-on-surface-variant">
        Loading documents…
      </div>
    )
  }

  const { totals, documents } = summary
  const totalBoxes = totals.draftBoxes + totals.lockedBoxes
  const completionPct =
    totalBoxes === 0 ? 0 : Math.round((100 * totals.lockedBoxes) / totalBoxes)

  const firstNeedsReview = documents.find((d) => d.draftCount > 0)

  return (
    <div className="min-h-full bg-surface">
      <div className="mb-6 grid grid-cols-12 gap-gutter">
        <div className="relative col-span-8 overflow-hidden rounded border border-outline-variant bg-surface-container-low p-6">
          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2 text-secondary">
              <Icon name="layers" />
              <span className="text-xs font-semibold uppercase tracking-widest">Redaction workspace</span>
            </div>
            <h1 className="mb-4 text-2xl font-bold">
              {totals.documentCount === 0
                ? 'No documents yet — upload from the sidebar'
                : `${completionPct}% of boxes locked (${totals.lockedBoxes} locked, ${totals.draftBoxes} draft)`}
            </h1>
            <div className="mb-2 h-2 overflow-hidden rounded-full border border-outline-variant bg-white">
              <div className="h-full bg-secondary" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{totals.documentCount} documents</span>
              <span>
                {totals.draftBoxes} draft boxes · {totals.lockedBoxes} locked boxes
              </span>
            </div>
          </div>
          <Icon name="picture_as_pdf" className="pointer-events-none absolute -bottom-10 -right-10 text-[240px] opacity-5" />
        </div>
        <div className="col-span-4 flex flex-col justify-between rounded bg-primary-container p-6 text-on-primary">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-primary-container">
              Next suggested step
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {firstNeedsReview
                ? `Review drafts in “${firstNeedsReview.name}”`
                : totals.documentCount === 0
                  ? 'Upload a PDF to begin'
                  : 'All tracked boxes are locked or clear'}
            </p>
          </div>
          {firstNeedsReview ? (
            <button
              type="button"
              className="mt-4 w-full rounded bg-white py-2.5 text-sm font-bold text-primary"
              onClick={() => onOpenDocument(firstNeedsReview.documentId as Id<'documents'>)}
            >
              Open in Workspace
            </button>
          ) : totals.documentCount > 0 ? (
            <button
              type="button"
              className="mt-4 w-full rounded bg-white py-2.5 text-sm font-bold text-primary"
              onClick={() => onOpenDocument(documents[0].documentId as Id<'documents'>)}
            >
              Open latest document
            </button>
          ) : (
            <p className="mt-4 text-xs text-on-primary-container">Use “Add Document” in the sidebar.</p>
          )}
        </div>
      </div>

      <section className="rounded border border-outline-variant bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Accessible documents</h2>
            <div className="flex gap-2">
              <span className="rounded bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                All ({totals.documentCount})
              </span>
              <span className="rounded bg-error-container px-3 py-1 text-xs font-semibold text-on-error-container">
                Drafts ({documents.filter((d) => d.draftCount > 0).length})
              </span>
            </div>
          </div>
        </div>
        {documents.length === 0 ? (
          <p className="p-8 text-center text-sm text-on-surface-variant">No PDFs synced to your account yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-2 font-semibold">Document</th>
                <th className="px-4 py-2 font-semibold">Progress</th>
                <th className="px-4 py-2 font-semibold">Boxes</th>
                <th className="px-4 py-2 font-semibold">Added</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const t = doc.draftCount + doc.lockedCount
                const pct = t === 0 ? 0 : Math.round((100 * doc.lockedCount) / t)
                let status: string
                let statusClass: string
                if (doc.draftCount > 0) {
                  status = 'Drafts pending'
                  statusClass = 'bg-error-container text-on-error-container'
                } else if (doc.lockedCount > 0) {
                  status = 'Ready for export review'
                  statusClass = 'bg-secondary-container/20 text-secondary'
                } else {
                  status = 'No boxes yet'
                  statusClass = 'bg-surface-container-high text-on-surface-variant'
                }
                const ext =
                  doc.name.toLowerCase().endsWith('.pdf') ? 'PDF' : doc.name.includes('.')
                    ? (doc.name.split('.').pop() ?? '—')
                        .toUpperCase()
                    : '—'

                return (
                  <tr
                    key={doc.documentId}
                    className="cursor-pointer border-b border-outline-variant/50 hover:bg-surface-container-low"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDocument(doc.documentId as Id<'documents'>)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        void onOpenDocument(doc.documentId as Id<'documents'>)
                    }}
                  >
                    <td className="flex items-center gap-2 px-4 py-3">
                      <Icon name="picture_as_pdf" className="text-error" size={18} />
                      {doc.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high">
                          <div className="h-full bg-secondary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant tabular-nums">
                      {doc.lockedCount} locked / {doc.draftCount} draft
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass}`}>
                        {status}
                      </span>
                      <span className="ml-2 text-[10px] text-on-surface-variant">{ext}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-on-surface-variant">
          <span>
            Showing {documents.length} of {documents.length} documents with access
          </span>
        </div>
      </section>
    </div>
  )
}
