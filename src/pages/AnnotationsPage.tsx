import { Icon } from '../components/ui/Icon'

export function AnnotationsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-outline-variant bg-surface px-4 py-2">
        <div className="flex items-center gap-2">
          <button type="button" className="rounded p-2 hover:bg-surface-container-low" aria-label="Zoom out">
            <Icon name="remove" />
          </button>
          <span className="text-xs font-semibold tabular-nums">100%</span>
          <button type="button" className="rounded p-2 hover:bg-surface-container-low" aria-label="Zoom in">
            <Icon name="add" />
          </button>
          <span className="mx-2 h-4 w-px bg-outline-variant" />
          <Icon name="pan_tool" className="text-on-surface-variant" />
          <Icon name="crop_free" className="text-on-surface-variant" />
          <Icon name="format_ink_highlighter" className="text-secondary" />
        </div>
        <span className="text-xs text-on-surface-variant">Page 4 of 128</span>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-auto rounded border border-outline-variant bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-xl font-bold uppercase tracking-widest">
            Memorandum of Understanding
          </h1>
          <p className="mb-4 text-sm leading-relaxed">
            This agreement governs the confidential exchange of materials between the parties. The
            disclosing party shall mark all{' '}
            <span className="inline-block rounded border-2 border-dashed border-secondary bg-secondary/10 px-8 py-0.5 align-middle">
              <span className="absolute -mt-5 text-[9px] font-bold uppercase text-secondary">Trade Secret</span>
            </span>{' '}
            materials accordingly.
          </p>
          <p className="text-sm leading-relaxed">
            Employee records containing{' '}
            <span className="inline-block bg-primary px-12 py-1 align-middle text-on-primary" />
            {' '}shall not be disclosed without written consent.
          </p>
          <p className="mt-4 text-sm">
            References to{' '}
            <span className="rounded border border-dashed border-purple-600 bg-purple-50 px-6 py-0.5">
              quantum encryption methodologies
            </span>{' '}
            require partner review.
          </p>
        </div>
      </div>

      <section className="mt-4 rounded border border-outline-variant bg-surface">
        <header className="flex items-center gap-2 border-b border-outline-variant px-4 py-2">
          <Icon name="history" className="text-secondary" />
          <h3 className="text-sm font-semibold">Audit Trail</h3>
        </header>
        <table className="w-full text-left text-xs">
          <tbody>
            <AuditRow time="10:42:15 AM" user="J. Doe" action="Applied Exemption Trade Secret to Page 4" link="Revert" />
            <AuditRow time="10:38:02 AM" user="System" action="AI suggested redaction on paragraph 3" link="View" />
            <AuditRow time="10:15:44 AM" user="S. Kumar" action="Locked redaction box #442" link="View" />
          </tbody>
        </table>
      </section>
    </div>
  )
}

function AuditRow({
  time,
  user,
  action,
  link,
}: {
  time: string
  user: string
  action: string
  link: string
}) {
  return (
    <tr className="border-b border-outline-variant/50 hover:bg-surface-container-low">
      <td className="px-4 py-2 font-mono text-on-surface-variant">{time}</td>
      <td className="px-4 py-2">
        <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-semibold">{user}</span>
      </td>
      <td className="px-4 py-2">{action}</td>
      <td className="px-4 py-2 text-right">
        <button type="button" className="font-semibold text-secondary">
          {link}
        </button>
      </td>
    </tr>
  )
}
