import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Icon } from '../components/ui/Icon'

function formatAuditTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

type Props = { sessionToken: string }

export function AnnotationsPage({ sessionToken }: Props) {
  const rows = useQuery(api.activity.recentRedactionActivity, { sessionToken, limit: 50 })

  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-4 rounded border border-outline-variant bg-surface px-4 py-4">
        <h2 className="text-lg font-semibold text-on-surface">Redaction audit</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Recent redaction boxes across all documents you can access. Detailed PDF markup lives on the Workspace tab when
          a file is selected.
        </p>
      </div>

      <section className="rounded border border-outline-variant bg-surface">
        <header className="flex items-center gap-2 border-b border-outline-variant px-4 py-2">
          <Icon name="history" className="text-secondary" />
          <h3 className="text-sm font-semibold">Activity timeline</h3>
        </header>
        {!rows ? (
          <p className="p-8 text-center text-xs text-on-surface-variant">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-on-surface-variant">
            No redaction boxes stored yet — open Workspace and annotate a PDF.
          </p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-2 font-semibold">Time</th>
                <th className="px-4 py-2 font-semibold">User</th>
                <th className="px-4 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.boxId} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-on-surface-variant">
                    {formatAuditTime(r.updatedAt)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-semibold">{r.userId}</span>
                  </td>
                  <td className="px-4 py-2">
                    Box on <strong>{r.documentName}</strong> · page {r.pageNumber} ·{' '}
                    <strong>{r.status}</strong>
                    {r.exemptionShortCodeSnapshot ? ` · ${r.exemptionShortCodeSnapshot}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
