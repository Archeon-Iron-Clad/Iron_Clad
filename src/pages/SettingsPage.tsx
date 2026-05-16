import { useMutation } from 'convex/react'
import { Icon } from '../components/ui/Icon'
import { PresenceBadge } from '../components/presence/PresenceBadge'
import { api } from '../../convex/_generated/api'
import { isConvexConfigured } from '../lib/convexClient'
import { clearStoredSessionToken } from '../lib/sessionToken'

type Props = {
  userEmail: string
  sessionToken: string
}

export function SettingsPage({ userEmail, sessionToken }: Props) {
  const convexReady = isConvexConfigured()
  const revokeSession = useMutation(api.session.revokeSession)

  const onSignOut = async () => {
    try {
      await revokeSession({ sessionToken })
    } catch {
      /* still clear local token */
    }
    clearStoredSessionToken()
    window.location.reload()
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Workspace preferences, identity, and connection to your backend.
        </p>
      </header>

      <section className="rounded-xl border border-outline-variant bg-surface-bright p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
            <Icon name="badge" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-on-surface">Identity</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Your email labels this Convex session—sign out below to switch accounts.
            </p>

            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-on-surface-variant">Current session</p>
            <code className="mt-1 block truncate rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm text-on-surface">
              {userEmail}
            </code>

            <div className="mt-6 border-t border-outline-variant pt-6">
              <p className="text-sm text-on-surface-variant">
                To use a different email, sign out on this device and sign in again with another address.
              </p>
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="mt-4 rounded-lg border border-outline-variant bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-bright p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Icon name="cloud_done" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-on-surface">Backend (Convex)</h2>
            <p className="mt-2 text-xs text-on-surface-variant">
              Sessions, documents, teams, and redactions are stored here.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <PresenceBadge label={convexReady ? 'Convex URL configured' : 'Convex URL missing'} />
            </div>
            {!convexReady && (
              <p className="mt-4 text-xs text-secondary">
                Set <code className="rounded bg-surface-container-high px-1 py-0.5">VITE_CONVEX_URL</code> in{' '}
                <code className="rounded bg-surface-container-high px-1 py-0.5">.env.local</code> and run{' '}
                <code className="rounded bg-surface-container-high px-1 py-0.5">npx convex dev</code>.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
