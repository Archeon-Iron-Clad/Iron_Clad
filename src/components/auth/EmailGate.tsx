import { IronCladLogo } from '../branding/IronCladLogo'
import { isConvexConfigured } from '../../lib/convexClient'
import { EmailSignInForm } from './EmailSignInForm'

export function EmailGate() {
  const convexReady = isConvexConfigured()

  if (!convexReady) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <IronCladLogo imgClassName="max-h-[52px]" />
        <p className="max-w-md text-center text-sm text-amber-800 dark:text-amber-200">
          Set <code className="rounded bg-amber-50 px-1 dark:bg-amber-950">VITE_CONVEX_URL</code> in{' '}
          <code className="rounded bg-amber-50 px-1 dark:bg-amber-950">.env.local</code> and run{' '}
          <code className="rounded bg-amber-50 px-1 dark:bg-amber-950">npx convex dev</code> to
          enable sign-in.
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
      <EmailSignInForm className="w-full max-w-sm" />
    </div>
  )
}
