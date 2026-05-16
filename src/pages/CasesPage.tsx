import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Id } from '../../convex/_generated/dataModel'
import { Icon } from '../components/ui/Icon'
import type { TeamsWithCasesPayload } from './TeamsPage'

export type CreateCasePayload = {
  matterName: string
  memberEmails: string[]
  /** Copy everyone currently on another shared roster (excluding the signed-in creator). */
  importMembersFromTeamId?: Id<'teams'>
  pdfFiles: File[]
}

type FlatCase = {
  case: {
    _id: Id<'cases'>
    teamId: Id<'teams'>
    name: string
    createdAt: number
    isDefault: boolean
  }
  team: TeamsWithCasesPayload['team']
  role: TeamsWithCasesPayload['role']
}

type Props = {
  convexReady: boolean
  teamsPayload: TeamsWithCasesPayload[]
  activeCaseId: string | null
  onOpenCase: (caseId: Id<'cases'>) => void | Promise<void>
  onCreateCase: (payload: CreateCasePayload) => void | Promise<void>
  /** Sidebar Create case bumps `wizardNonce`; handled marks opens we've processed. */
  wizardNonce?: number
  wizardHandledNonce?: number
  onWizardConsumedNonce?: (nonce: number) => void
  onDeleteCase: (caseId: Id<'cases'>) => void | Promise<void>
}

export function CasesPage({
  convexReady,
  teamsPayload,
  activeCaseId,
  onOpenCase,
  onCreateCase,
  wizardNonce = 0,
  wizardHandledNonce = 0,
  onWizardConsumedNonce,
  onDeleteCase,
}: Props) {
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [matterName, setMatterName] = useState('')
  const [memberRows, setMemberRows] = useState<string[]>([''])
  const [teamNameFilter, setTeamNameFilter] = useState('')
  const [importTeamId, setImportTeamId] = useState<Id<'teams'> | ''>('')
  const [pdfs, setPdfs] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: Id<'cases'>; summary: string } | null>(
    null,
  )
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const matterTiles = useMemo((): FlatCase[] => {
    const acc: FlatCase[] = []
    for (const tw of teamsPayload) {
      for (const { case: c } of tw.cases) {
        acc.push({ case: c, team: tw.team, role: tw.role })
      }
    }
    acc.sort((a, b) => b.case.createdAt - a.case.createdAt)
    return acc
  }, [teamsPayload])

  useEffect(() => {
    if (!createOpen) {
      setMatterName('')
      setMemberRows([''])
      setTeamNameFilter('')
      setImportTeamId('')
      setPdfs([])
      setFormError(null)
    }
  }, [createOpen])

  const teamNameLc = teamNameFilter.trim().toLowerCase()

  const collaborativeTeamsFilters = useMemo(() => {
    const collabTeams = teamsPayload.filter((tw) => tw.team.kind === 'collab')
    if (!teamNameLc) return collabTeams
    return collabTeams.filter(({ team }) => team.name.toLowerCase().includes(teamNameLc))
  }, [teamsPayload, teamNameLc])

  const teamSelectRows = useMemo(() => {
    if (!importTeamId) return collaborativeTeamsFilters
    if (collaborativeTeamsFilters.some(({ team }) => team._id === importTeamId))
      return collaborativeTeamsFilters
    const row = teamsPayload.find(({ team }) => team._id === importTeamId)
    return row && row.team.kind === 'collab' ? [row, ...collaborativeTeamsFilters] : collaborativeTeamsFilters
  }, [importTeamId, collaborativeTeamsFilters, teamsPayload])

  const importTeamMeta = importTeamId
    ? teamsPayload.find(({ team }) => team._id === importTeamId)
    : undefined

  useEffect(() => {
    if (!convexReady) return
    if (wizardNonce <= wizardHandledNonce) return
    setCreateOpen(true)
    onWizardConsumedNonce?.(wizardNonce)
  }, [wizardNonce, wizardHandledNonce, convexReady, onWizardConsumedNonce])

  const fmt = (ts: number) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts))

  async function confirmDelete() {
    if (!pendingDelete || deleteBusy) return
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await onDeleteCase(pendingDelete.id)
      setPendingDelete(null)
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e)
      const lower = raw.toLowerCase()
      if (lower.includes('could not find public function') || lower.includes('did you forget to run')) {
        setDeleteError(
          'Convex has not published the latest server code yet. Your browser URL may point at production while you only synced dev. Fix: open a terminal in this project and run `npx convex deploy` (confirm pushing to prod if asked), then try again—or set `VITE_CONVEX_URL` in `.env.local` to the dev URL from `npx convex dev`.',
        )
      } else {
        setDeleteError(raw)
      }
    } finally {
      setDeleteBusy(false)
    }
  }

  async function submitCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = matterName.trim()
    if (!trimmed || !convexReady || saving) return
    setFormError(null)
    setSaving(true)
    try {
      await onCreateCase({
        matterName: trimmed,
        memberEmails: memberRows,
        importMembersFromTeamId: importTeamId !== '' ? importTeamId : undefined,
        pdfFiles: pdfs,
      })
      setCreateOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create case')
    } finally {
      setSaving(false)
    }
  }

  const addMemberRow = () => setMemberRows((rows) => [...rows, ''])
  const removeMemberRow = (index: number) =>
    setMemberRows((rows) => (rows.length <= 1 ? [''] : rows.filter((_, i) => i !== index)))

  const onPdfPick = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list?.length) return
    const next = Array.from(list).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
    )
    setPdfs((prev) => [...prev, ...next])
    e.target.value = ''
  }

  const removePdf = (index: number) => setPdfs((prev) => prev.filter((_, i) => i !== index))

  return (
    <div className="min-h-full bg-surface p-6">
      <header className="mx-auto mb-8 max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Cases</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Matters live under teams. Collaborative teams expose every matter row here; uploads always target the matter
              selected in Teams/sidebar—even the empty Default shell.
            </p>
          </div>
        </div>

        {!convexReady ? (
          <p className="mt-6 rounded-lg border border-secondary-container bg-surface-container-low px-4 py-3 text-sm text-secondary">
            Connect Convex in Settings to load and create cases from the cloud.
          </p>
        ) : null}
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          disabled={!convexReady}
          onClick={() => convexReady && setCreateOpen(true)}
          className="flex min-h-[10.5rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright px-4 py-8 text-on-surface-variant transition-colors hover:border-secondary hover:bg-surface-container-low disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <Icon name="add" size={28} />
          </span>
          <span className="text-sm font-semibold text-on-surface">Collaborative matter</span>
          <span className="max-w-[14rem] text-center text-xs text-on-surface-variant">
            Spins up a shared team with Default + named matter—invite teammates and attach PDFs
          </span>
        </button>

        {matterTiles.map(({ case: c, team, role }) => {
          const active = activeCaseId === c._id
          const parentTeamTitle = team.kind === 'solo' ? 'Personal workspace' : team.name
          return (
            <div
              key={c._id}
              className={`flex min-h-[10.5rem] flex-col overflow-hidden rounded-xl border shadow-sm transition-all ${
                active
                  ? 'border-secondary bg-secondary-container/15 ring-2 ring-secondary ring-offset-2 ring-offset-surface'
                  : 'border-outline-variant bg-surface-bright hover:border-outline'
              }`}
            >
              <button
                type="button"
                disabled={!convexReady}
                onClick={() => convexReady && onOpenCase(c._id)}
                className="flex min-h-[7.75rem] flex-1 flex-col px-5 py-4 text-left transition-colors hover:bg-surface-container-low disabled:opacity-50"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-sm font-bold text-on-secondary-container">
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-on-surface">{c.name}</p>
                    <p className="mt-0.5 text-xs font-medium text-secondary">{parentTeamTitle}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{fmt(c.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      role === 'admin'
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {role === 'admin' ? 'Lead on team' : 'Member'}
                  </span>
                  {c.isDefault ? (
                    <span className="rounded-full bg-outline-variant px-2 py-0.5 font-semibold text-on-surface-variant">
                      Shell matter
                    </span>
                  ) : null}
                </div>
              </button>
              {role === 'admin' && !c.isDefault ? (
                <div className="flex items-center justify-end border-t border-outline-variant px-2 py-1.5">
                  <button
                    type="button"
                    disabled={!convexReady || deleteBusy}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-error hover:bg-error-container/35 disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteError(null)
                      setPendingDelete({
                        id: c._id,
                        summary: `${team.name} › ${c.name}`,
                      })
                    }}
                  >
                    <Icon name="delete_outline" size={16} aria-hidden />
                    Delete matter
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {createOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !saving && setCreateOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-outline-variant bg-surface-bright p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-case-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="create-case-heading" className="text-lg font-bold text-on-surface">
              New collaborative matter
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              We create a shared team whose name mirrors this matter plus a substantive matter beside the empty Default shell.
              Add people manually or prefilled from another team roster. PDF uploads land on your new substantive matter—not
              the Default shell—unless you revisit later via Teams/sidebar.
            </p>

            <form className="mt-5 flex flex-col gap-5" onSubmit={(e) => void submitCreate(e)}>
              {formError ? (
                <div className="rounded-lg border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">
                  {formError}
                </div>
              ) : null}

              <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
                Matter + team headline
                <input
                  autoFocus
                  value={matterName}
                  onChange={(e) => setMatterName(e.target.value)}
                  placeholder="e.g. Smith v. Acme · Phase 2"
                  className="rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface outline-none ring-secondary focus:border-transparent focus:ring-2"
                />
              </label>

              <fieldset className="flex flex-col gap-2 rounded-lg border border-outline-variant/80 bg-surface-container-low/40 p-3">
                <legend className="px-1 text-xs font-semibold text-on-surface">
                  Prefill roster from existing shared team (optional)
                </legend>
                <p className="text-[11px] text-on-surface-variant">
                  Copy everyone invited to another team (excluding yourself). Addresses merge with manual rows below.
                </p>
                <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
                  Filter by team name
                  <input
                    value={teamNameFilter}
                    onChange={(e) => setTeamNameFilter(e.target.value)}
                    placeholder="Type part of the shared team…"
                    autoComplete="off"
                    disabled={saving || !convexReady}
                    className="rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface outline-none ring-secondary focus:border-transparent focus:ring-2 disabled:opacity-50"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
                  Shared team roster to copy from
                  <select
                    value={importTeamId}
                    disabled={saving || !convexReady}
                    onChange={(e) => setImportTeamId(e.target.value as Id<'teams'> | '')}
                    className="rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface outline-none ring-secondary focus:border-transparent focus:ring-2 disabled:opacity-50"
                  >
                    <option value="">— None — invite only by email below</option>
                    {teamSelectRows.map(({ team, role }) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                        {' · '}
                        {role === 'admin' ? 'you are lead there' : 'you are member'}
                      </option>
                    ))}
                  </select>
                </label>
                {importTeamMeta ? (
                  <p className="text-[11px] text-secondary">
                    Roster pulls from{' '}
                    <span className="font-semibold">
                      {importTeamMeta.team.kind === 'solo' ? 'Personal workspace' : importTeamMeta.team.name}
                    </span>
                    .
                  </p>
                ) : null}
              </fieldset>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-on-surface-variant">Extra invite emails</span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-secondary hover:underline"
                    onClick={addMemberRow}
                  >
                    + Add email row
                  </button>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Combined with roster import above. You stay lead on both the new shared team and the substantive matter&apos;s uploads.
                </p>
                <ul className="flex flex-col gap-2">
                  {memberRows.map((row, i) => (
                    <li key={i} className="flex gap-2">
                      <input
                        type="email"
                        value={row}
                        onChange={(e) =>
                          setMemberRows((rows) => rows.map((r, j) => (j === i ? e.target.value : r)))
                        }
                        placeholder="colleague@firm.com"
                        autoComplete="off"
                        className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface outline-none ring-secondary focus:border-transparent focus:ring-2"
                      />
                      <button
                        type="button"
                        disabled={saving}
                        className="shrink-0 rounded-lg border border-outline-variant px-2 text-on-surface-variant hover:bg-surface-container-high"
                        aria-label="Remove row"
                        onClick={() => removeMemberRow(i)}
                      >
                        <Icon name="close" size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-on-surface-variant">Documents</span>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={onPdfPick}
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant bg-surface-container-low py-3 text-sm font-semibold text-on-surface transition-colors hover:border-secondary hover:bg-surface-container"
                >
                  <Icon name="upload_file" size={20} />
                  Add PDFs (attach to substantive matter)
                </button>
                {pdfs.length > 0 ? (
                  <ul className="max-h-32 overflow-y-auto rounded-lg border border-outline-variant bg-background p-2 text-xs">
                    {pdfs.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 py-1">
                        <span className="min-w-0 truncate text-on-surface">{f.name}</span>
                        <button
                          type="button"
                          disabled={saving}
                          className="shrink-0 text-on-surface-variant hover:text-error"
                          onClick={() => removePdf(i)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-on-surface-variant">
                    No files selected—you can bulk upload anytime from Thumbnails once the matter is highlighted.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  disabled={saving}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !matterName.trim()}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Creating…' : 'Create collaborative matter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !deleteBusy && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-bright p-6 shadow-xl"
            role="alertdialog"
            aria-labelledby="del-case-heading"
            aria-describedby="del-case-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="del-case-heading" className="text-lg font-bold text-on-surface">
              Delete matter?
            </h2>
            <p id="del-case-desc" className="mt-2 text-sm text-on-surface-variant">
              Remove <span className="font-semibold text-on-surface">&quot;{pendingDelete.summary}&quot;</span> forever.
              PDFs, redactions, and audit artifacts under this matter will be erased. Membership on the encompassing team stays
              intact if other matters remain.
            </p>
            {deleteError ? (
              <div className="mt-3 rounded-lg border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">
                {deleteError}
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
                onClick={() => !deleteBusy && setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-on-error hover:opacity-90 disabled:opacity-50"
                onClick={() => void confirmDelete()}
              >
                {deleteBusy ? 'Deleting…' : 'Delete matter'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
