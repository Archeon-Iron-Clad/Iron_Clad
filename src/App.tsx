import { useRef, useState } from 'react'
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../convex/_generated/api'
import { AppShell } from './components/layout/AppShell'
import { PdfViewer } from './components/pdf-viewer/PdfViewer'
import { CollaboratorList } from './components/presence/CollaboratorList'
import { PresenceBadge } from './components/presence/PresenceBadge'
import { isConvexConfigured } from './lib/convexClient'

const DEMO_PDF =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

function SignInWithGoogle() {
  const { signIn } = useAuthActions()
  return (
    <button
      type="button"
      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow ring-1 ring-zinc-200 hover:bg-zinc-50"
      onClick={() => void signIn('google')}
    >
      Sign in with Google
    </button>
  )
}

function SignOutButton() {
  const { signOut } = useAuthActions()
  return (
    <button
      type="button"
      className="text-sm text-zinc-600 underline-offset-2 hover:underline"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  )
}

function MainApp() {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const convexReady = isConvexConfigured()
  const me = useQuery(api.profile.current)

  const onUploadClick = () => fileInputRef.current?.click()

  const onFile = (f: FileList | null) => {
    const file = f?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
  }

  const onExportClick = () => {
    console.info('Export redacted PDF — implement in Phase 4')
  }

  const accountLabel =
    me === undefined
      ? '…'
      : me === null
        ? '—'
        : (me.email ?? me.name ?? me._id.slice(0, 8))

  return (
    <AppShell onUploadClick={onUploadClick} onExportClick={onExportClick}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files)}
      />

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <PresenceBadge label={convexReady ? 'Convex URL set' : 'Set VITE_CONVEX_URL'} />
          <span className="text-xs text-zinc-500">
            Signed in as{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5">{accountLabel}</code>
          </span>
          <SignOutButton />
        </div>
        {!convexReady && (
          <p className="mt-2 text-sm text-amber-800">
            Run <code className="rounded bg-amber-50 px-1">npx convex dev</code>, then add{' '}
            <code className="rounded bg-amber-50 px-1">VITE_CONVEX_URL</code> to{' '}
            <code className="rounded bg-amber-50 px-1">.env.local</code>.
          </p>
        )}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_220px]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-800">Document</h2>
            <button
              type="button"
              className="text-sm text-blue-600 underline-offset-2 hover:underline"
              onClick={() => setPdfUrl(DEMO_PDF)}
            >
              Load sample PDF
            </button>
          </div>
          <PdfViewer pdfUrl={pdfUrl} />
          {!pdfUrl && (
            <p className="mt-4 text-sm text-zinc-500">
              Upload a PDF or load the sample to exercise PDF.js rendering.
            </p>
          )}
        </section>
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-zinc-800">Here now</h2>
          <CollaboratorList collaborators={[]} />
        </aside>
      </div>
    </AppShell>
  )
}

function App() {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-600">
          Checking session…
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
          <p className="text-center text-sm text-zinc-600">Sign in with Google to use Iron Clad.</p>
          <SignInWithGoogle />
          {!isConvexConfigured() && (
            <p className="max-w-md text-center text-xs text-amber-800">
              Set <code className="rounded bg-amber-50 px-1">VITE_CONVEX_URL</code> in{' '}
              <code className="rounded bg-amber-50 px-1">.env.local</code> and run{' '}
              <code className="rounded bg-amber-50 px-1">npx convex dev</code>.
            </p>
          )}
        </div>
      </Unauthenticated>
      <Authenticated>
        <MainApp />
      </Authenticated>
    </>
  )
}

export default App
