import { useRef, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { PdfViewer } from './components/pdf-viewer/PdfViewer'
import { CollaboratorList } from './components/presence/CollaboratorList'
import { PresenceBadge } from './components/presence/PresenceBadge'
import { isConvexConfigured } from './lib/convexClient'
import { getOrCreateLocalUserId } from './lib/userId'

const DEMO_PDF =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

function App() {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const convexReady = isConvexConfigured()
  const userId = getOrCreateLocalUserId()

  const onUploadClick = () => fileInputRef.current?.click()

  const onFile = (f: FileList | null) => {
    const file = f?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
  }

  const onExportClick = () => {
    // Phase 4: fetch bytes + pdf-lib burn via `exportRedactedPdf`.
    console.info('Export redacted PDF — implement in Phase 4')
  }

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
            Session <code className="rounded bg-zinc-100 px-1 py-0.5">{userId.slice(0, 8)}…</code>
          </span>
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

export default App
