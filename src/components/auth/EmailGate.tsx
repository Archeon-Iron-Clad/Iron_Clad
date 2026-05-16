import { useMutation } from 'convex/react'
import { useState } from 'react'
import { IronCladLogo } from '../branding/IronCladLogo'
import { api } from '../../../convex/_generated/api'
import { isConvexConfigured } from '../../lib/convexClient'
import { setStoredSessionToken } from '../../lib/sessionToken'

export function EmailGate() {
  const convexReady = isConvexConfigured()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const signInWithEmail = useMutation(api.session.signInWithEmail)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!convexReady) return
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setError(null)
    setPending(true)
    try {
      const { sessionToken } = await signInWithEmail({ email: trimmed })
      setStoredSessionToken(sessionToken)
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
      setPending(false)
    }
  }

  if (!convexReady) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <IronCladLogo imgClassName="max-h-[52px]" />
        <p className="max-w-md text-center text-sm text-amber-800">
          Set <code className="rounded bg-amber-50 px-1">VITE_CONVEX_URL</code> in{' '}
          <code className="rounded bg-amber-50 px-1">.env.local</code> and run{' '}
          <code className="rounded bg-amber-50 px-1">npx convex dev</code> to enable sign-in.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <IronCladLogo imgClassName="max-h-[52px]" />
      <p className="max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400">
        Enter your work email to continue. This labels your edits and Convex session; identity is{' '}
        <strong>not</strong> verified by a third party.
      </p>
      <form className="flex w-full max-w-sm flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.com"
            className="rounded-md border border-zinc-300 px-3 py-2 font-normal"
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
