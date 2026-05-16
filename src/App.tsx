import { useMutation, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import { AppShell } from './components/layout/AppShell'
import type { OverlayBox } from './components/pdf-viewer/RedactionOverlay'
import { PdfViewer } from './components/pdf-viewer/PdfViewer'
import { CollaboratorList } from './components/presence/CollaboratorList'
import { PresenceBadge } from './components/presence/PresenceBadge'
import { getStoredActiveGroupId, setStoredActiveGroupId } from './lib/activeGroupId'
import { isConvexConfigured } from './lib/convexClient'
import {
  clearStoredUserEmail,
  getStoredUserEmail,
  setStoredUserEmail,
} from './lib/userEmail'

const DEMO_PDF =
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'

function EmailGate() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <p className="max-w-sm text-center text-sm text-zinc-600">
        Enter your work email to use Iron Clad. No password — we only store this to label your
        edits (not verified).
      </p>
      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = email.trim().toLowerCase()
          if (!trimmed.includes('@')) {
            setError('Enter a valid email address.')
            return
          }
          setError(null)
          setStoredUserEmail(trimmed)
          window.location.reload()
        }}
      >
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
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Continue
        </button>
      </form>
      {!isConvexConfigured() && (
        <p className="max-w-md text-center text-xs text-amber-800">
          Set <code className="rounded bg-amber-50 px-1">VITE_CONVEX_URL</code> in{' '}
          <code className="rounded bg-amber-50 px-1">.env.local</code> and run{' '}
          <code className="rounded bg-amber-50 px-1">npx convex dev</code>.
        </p>
      )}
    </div>
  )
}

function MainApp() {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | undefined>(undefined)
  const [convexDocId, setConvexDocId] = useState<Id<'documents'> | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(() => getStoredActiveGroupId())
  const [newGroupName, setNewGroupName] = useState('')
  const [addMemberEmail, setAddMemberEmail] = useState('')
  const [memberFeedback, setMemberFeedback] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const convexReady = isConvexConfigured()
  const userEmail = getStoredUserEmail()!

  const myGroups = useQuery(api.groups.listMyGroups, convexReady ? { userEmail } : 'skip')
  const accessibleDocs = useQuery(api.documents.listAccessible, convexReady ? { userEmail } : 'skip')

  const selectedDoc = useQuery(
    api.documents.get,
    convexReady && convexDocId ? { documentId: convexDocId, userEmail } : 'skip',
  )
  const pdfStorageUrl = useQuery(
    api.documents.getFileUrl,
    convexReady && selectedDoc
      ? { storageId: selectedDoc.storageId, userEmail }
      : 'skip',
  )

  const rawBoxes = useQuery(
    api.redactions.listByDocument,
    convexReady && convexDocId
      ? { documentId: convexDocId, userEmail }
      : 'skip',
  )

  const presenceRows = useQuery(
    api.presence.listPresentInDocument,
    convexReady && convexDocId
      ? { documentId: convexDocId, userEmail }
      : 'skip',
  )

  const membersForActiveGroup = useQuery(
    api.groups.listMembers,
    convexReady && activeGroupId
      ? { groupId: activeGroupId as Id<'groups'>, userEmail }
      : 'skip',
  )

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const createDocument = useMutation(api.documents.create)
  const createGroup = useMutation(api.groups.create)
  const addMember = useMutation(api.groups.addMember)
  const removeMember = useMutation(api.groups.removeMember)
  const presenceHeartbeat = useMutation(api.presence.heartbeat)

  const overlayBoxes: OverlayBox[] =
    rawBoxes?.map((b) => ({
      id: b._id,
      pageNumber: b.pageNumber,
      x: b.x,
      y: b.y,
      width: b.width,
      height: b.height,
      status: b.status,
      userId: b.userId,
      exemptionShortCodeSnapshot: b.exemptionShortCodeSnapshot,
      exemptionTitleSnapshot: b.exemptionTitleSnapshot,
    })) ?? []

  const pdfUrl =
    convexDocId && pdfStorageUrl !== undefined
      ? pdfStorageUrl ?? undefined
      : localPdfUrl

  const onUploadClick = () => fileInputRef.current?.click()

  useEffect(() => {
    if (!convexReady || !convexDocId) return
    presenceHeartbeat({
      userEmail,
      documentId: convexDocId,
    }).catch(() => {})
    const t = window.setInterval(() => {
      void presenceHeartbeat({ userEmail, documentId: convexDocId })
    }, 25_000)
    return () => window.clearInterval(t)
  }, [convexDocId, convexReady, presenceHeartbeat, userEmail])

  const onFile = async (f: FileList | null) => {
    const file = f?.[0]
    if (!file) return

    if (!convexReady) {
      const url = URL.createObjectURL(file)
      setLocalPdfUrl(url)
      setConvexDocId(null)
      return
    }

    try {
      const postUrl = await generateUploadUrl({ userEmail })
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!result.ok) throw new Error('Upload failed')
      const { storageId } = (await result.json()) as { storageId: string }

      const gid = activeGroupId !== null ? (activeGroupId as Id<'groups'>) : undefined
      const newId = await createDocument({
        storageId: storageId as Id<'_storage'>,
        name: file.name,
        userEmail,
        groupId: gid,
      })
      setConvexDocId(newId)
      setLocalPdfUrl(undefined)
    } catch (e) {
      console.error(e)
      const url = URL.createObjectURL(file)
      setLocalPdfUrl(url)
      setConvexDocId(null)
    }
  }

  const selectConvexDoc = (id: Id<'documents'>) => {
    setConvexDocId(id)
    setLocalPdfUrl(undefined)
  }

  const setGroupScope = (id: string | null) => {
    setActiveGroupId(id)
    setStoredActiveGroupId(id)
  }

  const onCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newGroupName.trim()
    if (!name || !convexReady) return
    await createGroup({ name, userEmail })
    setNewGroupName('')
  }

  const onAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGroupId || !convexReady) return
    setMemberFeedback(null)
    try {
      await addMember({
        groupId: activeGroupId as Id<'groups'>,
        targetEmail: addMemberEmail.trim(),
        userEmail,
      })
      setAddMemberEmail('')
    } catch (err) {
      setMemberFeedback(err instanceof Error ? err.message : 'Failed')
    }
  }

  const collaborators =
    presenceRows
      ?.filter((p) => p.userId !== userEmail)
      .map((p) => ({
        userId: p.userId,
        displayName: p.displayName,
        color: p.color,
      })) ?? []

  const activeGroupMeta = myGroups?.find(({ group }) => group._id === activeGroupId)
  const isGroupAdmin = activeGroupMeta?.role === 'admin'

  return (
    <AppShell onUploadClick={onUploadClick} onExportClick={() => console.info('Export — Phase 4')}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => void onFile(e.target.files)}
      />

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <PresenceBadge label={convexReady ? 'Convex URL set' : 'Set VITE_CONVEX_URL'} />
          <span className="text-xs text-zinc-500">
            Editing as{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5">{userEmail}</code>
          </span>
          <button
            type="button"
            className="text-sm text-zinc-600 underline-offset-2 hover:underline"
            onClick={() => {
              clearStoredUserEmail()
              window.location.reload()
            }}
          >
            Change email
          </button>
        </div>
        {!convexReady && (
          <p className="mt-2 text-sm text-amber-800">
            Run <code className="rounded bg-amber-50 px-1">npx convex dev</code>, then add{' '}
            <code className="rounded bg-amber-50 px-1">VITE_CONVEX_URL</code> to{' '}
            <code className="rounded bg-amber-50 px-1">.env.local</code>.
          </p>
        )}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-zinc-800">New uploads go to</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGroupScope(null)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                activeGroupId === null
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 bg-white text-zinc-700'
              }`}
            >
              Personal
            </button>
            {myGroups?.map(({ group }) => (
              <button
                key={group._id}
                type="button"
                onClick={() => setGroupScope(group._id)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  activeGroupId === group._id
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-300 bg-white text-zinc-700'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
          {convexReady && (
            <form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => void onCreateGroup(e)}>
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New group name"
                className="min-w-[12rem] flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-800"
              >
                Create group
              </button>
            </form>
          )}
        </section>

        {convexReady && activeGroupId && (
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-medium text-zinc-800">Group members</h2>
            <ul className="mb-3 flex flex-col gap-1 text-sm text-zinc-700">
              {membersForActiveGroup?.map((m) => (
                <li key={m._id} className="flex items-center justify-between gap-2">
                  <span>
                    {m.userId}
                    {m.role === 'admin' ? (
                      <span className="ml-1 text-xs text-zinc-500">(admin)</span>
                    ) : null}
                  </span>
                  {(isGroupAdmin && m.userId !== userEmail) || m.userId === userEmail ? (
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() =>
                        void removeMember({
                          groupId: activeGroupId as Id<'groups'>,
                          targetEmail: m.userId,
                          userEmail,
                        })
                      }
                    >
                      {m.userId === userEmail ? 'Leave' : 'Remove'}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            {isGroupAdmin ? (
              <form className="flex flex-wrap gap-2" onSubmit={(e) => void onAddMember(e)}>
                <input
                  type="email"
                  value={addMemberEmail}
                  onChange={(e) => setAddMemberEmail(e.target.value)}
                  placeholder="colleague@firm.com"
                  className="min-w-[12rem] flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-800"
                >
                  Add member
                </button>
              </form>
            ) : (
              <p className="text-xs text-zinc-500">Only admins can add members.</p>
            )}
            {memberFeedback && <p className="mt-2 text-sm text-red-600">{memberFeedback}</p>}
          </section>
        )}
      </div>

      {convexReady && accessibleDocs && accessibleDocs.length > 0 && (
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-zinc-800">Your documents</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {accessibleDocs.map((d) => (
              <li key={d._id}>
                <button
                  type="button"
                  className={`text-left hover:underline ${
                    convexDocId === d._id ? 'font-medium text-blue-700' : 'text-zinc-700'
                  }`}
                  onClick={() => selectConvexDoc(d._id)}
                >
                  {d.name}
                  {d.groupId ? (
                    <span className="ml-2 text-xs text-zinc-500">(group)</span>
                  ) : (
                    <span className="ml-2 text-xs text-zinc-500">(personal)</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_220px]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-800">Document</h2>
            <button
              type="button"
              className="text-sm text-blue-600 underline-offset-2 hover:underline"
              onClick={() => {
                setLocalPdfUrl(DEMO_PDF)
                setConvexDocId(null)
              }}
            >
              Load sample PDF
            </button>
          </div>
          <PdfViewer pdfUrl={pdfUrl} boxes={overlayBoxes} />
          {!pdfUrl && (
            <p className="mt-4 text-sm text-zinc-500">
              Upload a PDF or load the sample to exercise PDF.js rendering.
            </p>
          )}
        </section>
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-medium text-zinc-800">Here now</h2>
          <CollaboratorList collaborators={collaborators} />
        </aside>
      </div>
    </AppShell>
  )
}

function App() {
  const hasEmail = typeof window !== 'undefined' && getStoredUserEmail() !== null

  return hasEmail ? <MainApp /> : <EmailGate />
}

export default App
