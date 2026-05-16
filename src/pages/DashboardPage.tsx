import { Icon } from '../components/ui/Icon'

const DOCS = [
  { name: 'Purchase_Agreement_v4.pdf', type: 'Contract', progress: 100, date: 'Oct 24, 2023', status: 'Complete' },
  { name: 'Deposition_Transcript_A.txt', type: 'Transcript', progress: 45, date: 'Oct 22, 2023', status: 'Action' },
  { name: 'Financial_Exhibit_Q3.xlsx', type: 'Financial', progress: 78, date: 'Oct 20, 2023', status: 'Review' },
  { name: 'Discovery_Memo_Draft.pdf', type: 'Agreement', progress: 92, date: 'Oct 18, 2023', status: 'Complete' },
]

export function DashboardPage() {
  return (
    <div className="min-h-full bg-surface">
      <div className="mb-6 grid grid-cols-12 gap-gutter">
        <div className="relative col-span-8 overflow-hidden rounded border border-outline-variant bg-surface-container-low p-6">
          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2 text-secondary">
              <Icon name="auto_awesome" />
              <span className="text-xs font-semibold uppercase tracking-widest">Intelligent Scan Status</span>
            </div>
            <h1 className="mb-4 text-2xl font-bold">84% of PII identified across 12 files</h1>
            <div className="mb-2 h-2 overflow-hidden rounded-full border border-outline-variant bg-white">
              <div className="h-full bg-secondary" style={{ width: '84%' }} />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>4,290 Identifiers Flagged</span>
              <span>710 Pending Verification</span>
            </div>
          </div>
          <Icon name="bolt" className="pointer-events-none absolute -bottom-10 -right-10 text-[240px] opacity-5" />
        </div>
        <div className="col-span-4 flex flex-col justify-between rounded bg-primary-container p-6 text-on-primary">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-primary-container">
              Next Recommended Action
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              Review Conflict in &apos;Purchase_Agreement_v4.pdf&apos;
            </p>
          </div>
          <button type="button" className="mt-4 w-full rounded bg-white py-2.5 text-sm font-bold text-primary">
            Resolve Now
          </button>
        </div>
      </div>

      <section className="rounded border border-outline-variant bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Case Documents</h2>
            <div className="flex gap-2">
              <button type="button" className="rounded bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                All (12)
              </button>
              <button type="button" className="rounded bg-error-container px-3 py-1 text-xs font-semibold text-on-error-container">
                Action Required (3)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded border border-outline-variant px-3 py-1.5">
            <Icon name="search" className="text-on-surface-variant" size={18} />
            <input
              type="text"
              placeholder="Search case documents..."
              className="w-48 border-none bg-transparent text-sm focus:outline-none"
            />
            <Icon name="filter_list" className="text-on-surface-variant" />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-2 font-semibold">Document</th>
              <th className="px-4 py-2 font-semibold">Scan Progress</th>
              <th className="px-4 py-2 font-semibold">Type</th>
              <th className="px-4 py-2 font-semibold">Date Added</th>
              <th className="px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {DOCS.map((doc) => (
              <tr key={doc.name} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                <td className="flex items-center gap-2 px-4 py-3">
                  <Icon name="picture_as_pdf" className="text-error" size={18} />
                  {doc.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full bg-secondary" style={{ width: `${doc.progress}%` }} />
                    </div>
                    <span className="text-xs tabular-nums">{doc.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{doc.type}</td>
                <td className="px-4 py-3 text-on-surface-variant">{doc.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      doc.status === 'Action'
                        ? 'bg-error-container text-on-error-container'
                        : doc.status === 'Review'
                          ? 'bg-surface-container-high text-secondary'
                          : 'bg-secondary-container/20 text-secondary'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-on-surface-variant">
          <span>Showing 4 of 12 documents</span>
          <div className="flex gap-1">
            <button type="button" className="rounded border border-outline-variant px-2 py-1">Previous</button>
            <button type="button" className="rounded bg-secondary-container px-2 py-1 font-semibold text-on-secondary-container">1</button>
            <button type="button" className="rounded border border-outline-variant px-2 py-1">2</button>
            <button type="button" className="rounded border border-outline-variant px-2 py-1">Next</button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-gutter">
        <div className="rounded border border-outline-variant p-4">
          <h3 className="mb-3 text-xs font-bold uppercase text-on-surface-variant">Data Density Map</h3>
          <div className="flex h-24 items-end gap-2">
            {[60, 85, 45, 70, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-secondary" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="mt-2 text-[10px] text-on-surface-variant">Names • Addresses • SSNs</p>
        </div>
        <div className="rounded border border-outline-variant p-4">
          <h3 className="text-xs font-bold uppercase text-on-surface-variant">Automated Compliance Report</h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Full audit trail of redaction decisions and reviewer sign-offs.
          </p>
          <button type="button" className="mt-3 text-sm font-semibold text-secondary">
            View Report Details →
          </button>
        </div>
      </div>
    </div>
  )
}
