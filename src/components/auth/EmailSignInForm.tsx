import { useMutation } from 'convex/react'
import { useState, type FormEvent } from 'react'
import { api } from '../../../convex/_generated/api'
import { isConvexConfigured } from '../../lib/convexClient'
import { setStoredSessionToken } from '../../lib/sessionToken'

type Variant = 'default' | 'marketing'

type Props = {
  variant?: Variant
  submitLabel?: string
  className?: string
}

export function EmailSignInForm({
  variant = 'default',
  submitLabel,
  className = '',
}: Props) {
  const convexReady = isConvexConfigured()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const signInWithEmail = useMutation(api.session.signInWithEmail)

  const onSubmit = async (e: FormEvent) => {
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
      <p
        className={
          variant === 'marketing'
            ? 'text-sm text-white/70'
            : 'text-sm text-amber-800'
        }
      >
        Set <code className="rounded bg-white/10 px-1">VITE_CONVEX_URL</code> in{' '}
        <code className="rounded bg-white/10 px-1">.env.local</code> and run{' '}
        <code className="rounded bg-white/10 px-1">npx convex dev</code> to enable sign-in.
      </p>
    )
  }

  const isMarketing = variant === 'marketing'
  const labelClass = isMarketing
    ? 'text-sm font-medium text-white/90'
    : 'text-sm font-medium text-zinc-700 dark:text-zinc-300'
  const inputClass = isMarketing
    ? 'rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-normal text-white placeholder:text-white/40 backdrop-blur-sm focus:border-[#aac7ff] focus:outline-none focus:ring-2 focus:ring-[#aac7ff]/30'
    : 'rounded-md border border-zinc-300 px-3 py-2 font-normal dark:border-zinc-600 dark:bg-zinc-900'
  const buttonClass = isMarketing
    ? 'rounded-lg bg-[#0051d5] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0051d5]/25 transition hover:bg-[#316bf3] disabled:opacity-60'
    : 'rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white'
  const errorClass = isMarketing ? 'text-sm text-red-300' : 'text-sm text-red-600'

  return (
    <form
      className={`flex w-full flex-col gap-3 ${className}`}
      onSubmit={(e) => void onSubmit(e)}
    >
      <label className={`flex flex-col gap-1.5 ${labelClass}`}>
        Work email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@firm.com"
          className={inputClass}
          required
        />
      </label>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? 'Signing in…' : (submitLabel ?? 'Continue')}
      </button>
    </form>
  )
}
