import { Icon } from '../components/ui/Icon'

const ROWS = [
  { name: 'Exh_A_Financials_Q3.pdf', progress: 100, pii: 12, status: 'READY', statusClass: 'bg-secondary-container text-on-secondary-container' },
  { name: 'Internal_Comms_Thread.eml', progress: 60, pii: 8, status: 'CONFLICT', statusClass: 'bg-error-container text-on-error-container', checked: true },
  { name: 'HR_Personnel_File_Smith.pdf', progress: 95, pii: 24, status: 'REVIEW', statusClass: 'bg-surface-container-high text-secondary' },
  { name: 'Scan_0042_Receipts.tiff', progress: 10, pii: 3, status: 'OCR QUEUED', statusClass: 'bg-surface-container-low text-on-surface-variant' },
]

export function BatchPage() {
  return (
    <div className="min-h-full bg-surface">
      <header className="mb-6">
        <h2 className="text-2xl font-bold">Batch Redaction Dashboard</h2>
        <p className="text-sm text-on-surface-variant">
          Manage bulk redactions and pre-export conflicts across all active documents.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-gutter lg:grid-cols-4">
        <StatCard icon="description" label="Total Files" value="1,492" />
        <StatCard icon="warning" label="Flagged PII" value="8,304" sub="+124 unreviewed" subClass="text-error" />
        <StatCard icon="check_circle" label="Resolved Conflicts" value="342" />
        <StatCard icon="delete" label="Ready for Production" value="1,150" showBar barWidth="77%" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Enter entity name, RegEx, or SSN pattern..."
          className="min-w-[200px] flex-1 rounded border border-outline-variant px-4 py-2 text-sm"
        />
        <button type="button" className="flex items-center gap-2 rounded border border-secondary px-4 py-2 text-sm font-semibold text-secondary">
          <Icon name="tune" />
          Options
        </button>
        <button type="button" className="rounded bg-primary px-6 py-2 text-sm font-semibold text-on-primary">
          Find &amp; Mark
        </button>
      </div>

      <section className="rounded border border-outline-variant">
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-2 text-xs text-on-surface-variant">
          <span>Processing Queue</span>
          <span>Showing 1–15 of 1,492</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
            <tr>
              <th className="w-10 px-4 py-2" />
              <th className="px-4 py-2">Document Name</th>
              <th className="px-4 py-2">Redaction Progress</th>
              <th className="px-4 py-2">Critical PII</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.name} className="border-t border-outline-variant/50 hover:bg-surface-container-low">
                <td className="px-4 py-3">
                  <input type="checkbox" defaultChecked={row.checked} className="rounded" />
                </td>
                <td className="flex items-center gap-2 px-4 py-3 font-medium">
                  <Icon name="picture_as_pdf" size={18} />
                  {row.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className={`h-full ${row.progress < 50 ? 'bg-error' : 'bg-secondary'}`}
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums">{row.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.pii}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.statusClass}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  showBar,
  barWidth,
}: {
  icon: string
  label: string
  value: string
  sub?: string
  subClass?: string
  showBar?: boolean
  barWidth?: string
}) {
  return (
    <div className="rounded border border-outline-variant bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-on-surface-variant">{label}</span>
        <Icon name={icon} className="text-on-surface-variant" size={20} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className={`text-xs ${subClass}`}>{sub}</p>}
      {showBar && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full bg-secondary" style={{ width: barWidth }} />
        </div>
      )}
    </div>
  )
}
