import { useQuery } from 'convex/react'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { Icon } from '../components/ui/Icon'

type Props = {
  sessionToken: string
  onOpenDocument: (id: Id<'documents'>) => void
}

function formatInt(n: number): string {
  return n.toLocaleString()
}

export function BatchPage({ sessionToken, onOpenDocument }: Props) {
  const summary = useQuery(api.dashboard.summaryForUser, { sessionToken })

  if (!summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-on-surface-variant">
        Loading queue…
      </div>
    )
  }

  const { totals, documents } = summary

  return (
    <div className="mx-auto min-h-full w-full max-w-4xl px-4 pb-10 pt-2 sm:px-6 lg:max-w-5xl lg:px-10">
      <header className="mb-6">
        <h2 className="text-2xl font-bold">Batch Redaction Dashboard</h2>
        <p className="text-sm text-on-surface-variant">
          Snapshot of every document you can access and its redaction box counts from Convex.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-gutter lg:grid-cols-4">
        <StatCard icon="description" label="Documents" value={formatInt(totals.documentCount)} />
        <StatCard
          icon="warning"
          label="Draft boxes"
          value={formatInt(totals.draftBoxes)}
          sub="Awaiting lock / review"
          subClass="text-error"
        />
        <StatCard icon="check_circle" label="Locked boxes" value={formatInt(totals.lockedBoxes)} />
        <StatCard
          icon="percent"
          label="Completion rate"
          value={`${
            totals.draftBoxes + totals.lockedBoxes === 0
              ? '—'
              : `${Math.round(
                  (100 * totals.lockedBoxes) /
                    Math.max(totals.draftBoxes + totals.lockedBoxes, 1),
                )}%`
          }`}
        />
      </div>

      <section className="rounded border border-outline-variant">
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-2 text-xs text-on-surface-variant">
          <span>Processing queue</span>
          <span>
            {documents.length === 0 ? 'No rows' : `Showing all ${documents.length}`}
          </span>
        </div>
        {documents.length === 0 ? (
          <p className="p-8 text-center text-sm text-on-surface-variant">Upload PDFs from the Workspace sidebar.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-2">Document Name</th>
                <th className="px-4 py-2">Redaction Progress</th>
                <th className="px-4 py-2">Draft / Locked</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((row) => {
                const boxes = row.draftCount + row.lockedCount
                const pct = boxes === 0 ? 0 : Math.round((100 * row.lockedCount) / boxes)
                let status: string
                let statusClass: string
                if (row.draftCount > 0) {
                  status = 'Drafts pending'
                  statusClass = 'bg-error-container text-on-error-container'
                } else if (row.lockedCount > 0) {
                  status = 'Queued for export prep'
                  statusClass = 'bg-secondary-container text-on-secondary-container'
                } else {
                  status = 'No boxes'
                  statusClass = 'bg-surface-container-low text-on-surface-variant'
                }

                return (
                <tr
                  key={row.documentId}
                  className="cursor-pointer border-t border-outline-variant/50 hover:bg-surface-container-low"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenDocument(row.documentId as Id<'documents'>)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onOpenDocument(row.documentId as Id<'documents'>)
                  }}
                >
                    <td className="flex items-center gap-2 px-4 py-3 font-medium">
                      <Icon name="picture_as_pdf" size={18} />
                      {row.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-container-high">
                          <div
                            className={`h-full ${row.draftCount > 0 ? 'bg-error' : 'bg-secondary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.draftCount} / {row.lockedCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subClass,
}: {
  icon: string
  label: string
  value: string
  sub?: string
  subClass?: string
}) {
  return (
    <div className="rounded border border-outline-variant bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-on-surface-variant">{label}</span>
        <Icon name={icon} className="text-on-surface-variant" size={20} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className={`text-xs ${subClass ?? 'text-on-surface-variant'}`}>{sub}</p>}
    </div>
  )
}
