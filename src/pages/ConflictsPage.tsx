import { Icon } from '../components/ui/Icon'

export function ConflictsPage() {
  return (
    <div className="min-h-full bg-surface-container-lowest">
      <div className="mb-6 flex items-end justify-between border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Conflict Resolution Queue</h2>
          <p className="text-sm text-on-surface-variant">Senior Partner Review • 3 Pending Conflicts</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded bg-error px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-on-error shadow-lg"
        >
          <Icon name="local_fire_department" />
          Finalize &amp; Burn
        </button>
      </div>

      <article className="mb-8 overflow-hidden rounded-lg border border-outline-variant bg-surface">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-high px-4 py-2">
          <div className="flex items-center gap-4">
            <span className="rounded bg-error px-2 py-0.5 text-[10px] font-bold text-on-error">CONFLICT #01</span>
            <span className="text-xs font-semibold">Discovery_Exhibit_A.pdf • Page 14</span>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded border border-secondary px-3 py-1 text-xs font-semibold text-secondary">
              Accept AI
            </button>
            <button type="button" className="rounded border border-secondary px-3 py-1 text-xs font-semibold text-secondary">
              Accept User
            </button>
          </div>
        </header>
        <div className="grid md:grid-cols-2">
          <section className="border-r border-outline-variant p-6">
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Original Text Source
            </h4>
            <p className="rounded border border-outline-variant bg-white p-4 text-sm leading-relaxed">
              ...the strategic partnership with{' '}
              <span className="rounded bg-secondary-container/20 px-1 font-mono text-secondary">
                NovaTech Systems
              </span>{' '}
              involves a total capital expenditure of $45M, directed specifically at the{' '}
              <span className="rounded bg-error-container/40 px-1 font-mono text-error">
                Proprietary Graphene Lattice
              </span>{' '}
              fabrication process...
            </p>
          </section>
          <section className="bg-surface-bright p-6">
            <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Proposed Redaction Reasons
            </h4>
            <div className="space-y-4">
              <ReasonCard
                icon="bolt"
                filled
                title="AI Suggestion"
                meta="98% Confidence"
                reason="Trade Secret (Exemption 4)"
                note="Identifies specific manufacturing methodologies protected under NDA."
                variant="ai"
              />
              <ReasonCard
                icon="person"
                title="Associate Lawyer (R. Miller)"
                meta="Flagged: 2h ago"
                reason="Personal Privacy (PII)"
                note="Disagrees with Trade Secret classification; suggests PII related to board member names."
                variant="user"
              />
            </div>
          </section>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <MetricCard title="Review Velocity" value="1.4" unit="sec/page" progress={75} />
        <div className="rounded-lg border border-outline-variant bg-surface p-4">
          <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Team Sentiment
          </h5>
          <p className="text-sm font-semibold">65% Agree with AI</p>
        </div>
        <div className="rounded-lg bg-primary-container p-4 text-white">
          <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-primary-container">
            AI Queue Health
          </h5>
          <p className="flex items-center gap-2 text-sm">
            <Icon name="check_circle" filled className="text-secondary-fixed-dim" />
            Stable processing
          </p>
          <p className="mt-2 text-[10px] text-on-primary-container">Model v4.2.1 | All nodes active</p>
        </div>
      </div>
    </div>
  )
}

function ReasonCard({
  icon,
  filled,
  title,
  meta,
  reason,
  note,
  variant,
}: {
  icon: string
  filled?: boolean
  title: string
  meta: string
  reason: string
  note: string
  variant: 'ai' | 'user'
}) {
  const isAi = variant === 'ai'
  return (
    <div
      className={`flex gap-4 rounded border-2 p-4 ${
        isAi ? 'border-secondary bg-white shadow-sm' : 'border-dashed border-error bg-error-container/20'
      }`}
    >
      <div className={`rounded p-2 ${isAi ? 'bg-secondary-container' : 'bg-error'}`}>
        <Icon name={icon} filled={filled} className={isAi ? 'text-on-secondary-container' : 'text-on-error'} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-xs font-semibold">{title}</span>
          <span className="text-[10px] italic text-on-surface-variant">{meta}</span>
        </div>
        <p className={`mt-1 text-sm font-semibold ${isAi ? 'text-secondary' : 'text-error'}`}>{reason}</p>
        <p className="mt-1 text-xs italic text-on-surface-variant">{note}</p>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  unit,
  progress,
}: {
  title: string
  value: string
  unit: string
  progress: number
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface p-4">
      <div>
        <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{title}</h5>
        <p className="text-2xl font-bold">
          {value} <span className="text-sm font-normal text-on-surface-variant">{unit}</span>
        </p>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full bg-secondary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
