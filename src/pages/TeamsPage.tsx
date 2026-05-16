import type { Id } from '../../convex/_generated/dataModel'
import { Icon } from '../components/ui/Icon'
import type { FormEvent } from 'react'

export type TeamsWithCasesPayload = {
  team: {
    _id: Id<'teams'>
    name: string
    createdAt: number
    kind: 'solo' | 'collab'
  }
  role: 'admin' | 'member'
  cases: {
    case: {
      _id: Id<'cases'>
      teamId: Id<'teams'>
      name: string
      createdAt: number
      isDefault: boolean
    }
  }[]
}

type MemberRow = {
  _id: Id<'teamMembers'>
  teamId: Id<'teams'>
  userId: string
  role: 'admin' | 'member'
  joinedAt: number
}

type Props = {
  convexReady: boolean
  userEmail: string
  teamsPayload: TeamsWithCasesPayload[]
  activeCaseId: string | null
  onSelectCase: (caseId: Id<'cases'>) => void | Promise<void>
  newCollaborativeTeamName: string
  onNewCollaborativeTeamNameChange: (v: string) => void
  onCreateCollaborativeTeamSubmit: (e: FormEvent) => void | Promise<void>
  activeTeamForMembersId: Id<'teams'> | null
  membersForActiveTeam: MemberRow[] | undefined
  isTeamAdmin: boolean
  addMemberEmail: string
  onAddMemberEmailChange: (v: string) => void
  onAddMember: (e: FormEvent) => void | Promise<void>
  memberFeedback: string | null
  onRemoveMember: (targetEmail: string) => void
  /** Full collaborative team teardown (admin-only). */
  onDeleteTeam?: () => void
}

export function TeamsPage({
  convexReady,
  userEmail,
  teamsPayload,
  activeCaseId,
  onSelectCase,
  newCollaborativeTeamName,
  onNewCollaborativeTeamNameChange,
  onCreateCollaborativeTeamSubmit,
  activeTeamForMembersId,
  membersForActiveTeam,
  isTeamAdmin,
  addMemberEmail,
  onAddMemberEmailChange,
  onAddMember,
  memberFeedback,
  onRemoveMember,
  onDeleteTeam,
}: Props) {
  const pillActive = 'border-secondary bg-secondary font-semibold text-on-secondary'
  const pillIdle =
    'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high'

  const teamHeading = (payload: TeamsWithCasesPayload) =>
    payload.team.kind === 'solo' ? 'Personal workspace' : payload.team.name

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-on-surface">Teams</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Collaborative teams span multiple matters. Every PDF attaches to exactly one matter (case)—pick the highlighted
          row before uploads from the sidebar.
        </p>
      </header>

      <section className="rounded-xl border border-outline-variant bg-surface-bright p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
            <Icon name="upload_file" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-on-surface">Which matter receives uploads</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Matters are grouped under each team—Default case stays at the front of each list.
            </p>
            {!convexReady ? (
              <p className="mt-4 text-xs text-secondary">
                Connect Convex in Settings to enable teams and cloud documents.
              </p>
            ) : (
              <>
                <div className="mt-4 flex flex-col gap-4">
                  {teamsPayload.map((tw) => (
                    <div key={tw.team._id} className="rounded-lg border border-outline-variant bg-background p-3">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                        {teamHeading(tw)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tw.cases.map(({ case: c }) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => void onSelectCase(c._id)}
                            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                              activeCaseId === c._id ? pillActive : pillIdle
                            }`}
                          >
                            {c.name}
                            {c.isDefault ? '' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {teamsPayload.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">Loading matters…</p>
                  ) : null}
                </div>
                <form
                  className="mt-6 flex flex-wrap gap-2 border-t border-outline-variant pt-6"
                  onSubmit={(e) => void onCreateCollaborativeTeamSubmit(e)}
                >
                  <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-on-surface-variant">
                    New shared team name
                    <input
                      value={newCollaborativeTeamName}
                      onChange={(e) => onNewCollaborativeTeamNameChange(e.target.value)}
                      placeholder="e.g. Acme disclosure team"
                      className="rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="rounded-lg border border-outline-variant bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container hover:opacity-90"
                    >
                      Create team + default matter
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-bright p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Icon name="groups" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-on-surface">People on this team</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Admins can invite teammates by email ({userEmail.split('@')[1] ?? 'your domain'}). Everyone must sign in with
              the invited address so Convex can match membership.
            </p>

            {!convexReady ? null : activeTeamForMembersId === null ? (
              <p className="mt-4 text-sm text-on-surface-variant">
                Pick a collaborative team&apos;s matter above to manage invitations. Personal workspace is single-player by
                design.
              </p>
            ) : (
              <>
                <ul className="mt-4 space-y-2">
                  {membersForActiveTeam?.map((m) => (
                    <li
                      key={m._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface"
                    >
                      <span className="min-w-0 truncate">
                        {m.userId}
                        {m.role === 'admin' ? (
                          <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                            Admin
                          </span>
                        ) : null}
                      </span>
                      {(isTeamAdmin && m.userId !== userEmail) || m.userId === userEmail ? (
                        <button
                          type="button"
                          className="shrink-0 text-xs font-semibold uppercase tracking-wide text-error hover:underline"
                          onClick={() => onRemoveMember(m.userId)}
                        >
                          {m.userId === userEmail ? 'Leave team' : 'Remove'}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-outline-variant pt-6">
                  {isTeamAdmin ? (
                    <form className="flex flex-wrap gap-2" onSubmit={(e) => void onAddMember(e)}>
                      <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-on-surface-variant">
                        Invite by email
                        <input
                          type="email"
                          autoComplete="email"
                          value={addMemberEmail}
                          onChange={(e) => onAddMemberEmailChange(e.target.value)}
                          placeholder="colleague@firm.com"
                          className="rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface"
                        />
                      </label>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="rounded-lg border border-outline-variant bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
                        >
                          Add member
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-on-surface-variant">Only admins can add people to this team.</p>
                  )}
                  {memberFeedback ? <p className="mt-3 text-sm text-error">{memberFeedback}</p> : null}
                </div>

                {onDeleteTeam ? (
                  <div className="mt-6 border-t border-outline-variant pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const ok =
                          typeof window !== 'undefined' &&
                          window.confirm('Delete entire shared team and every matter/document inside it?')
                        if (ok) onDeleteTeam()
                      }}
                      className="text-xs font-bold uppercase tracking-wide text-error hover:underline"
                    >
                      Delete shared team permanently
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
