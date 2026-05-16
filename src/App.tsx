import { useMutation, useQuery } from 'convex/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import { EmailGate } from './components/auth/EmailGate'
import { AppShell } from './components/layout/AppShell'
import { SimpleRightPanel } from './components/layout/panels/SimpleRightPanel'
import { WorkspaceRightPanel } from './components/layout/panels/WorkspaceRightPanel'
import type { OverlayBox } from './components/pdf-viewer/RedactionOverlay'
import { clearStoredSessionToken, getStoredSessionToken } from './lib/sessionToken'
import { isConvexConfigured } from './lib/convexClient'
import { useDocumentUpload } from './lib/hooks/useDocumentUpload'
import { usePresenceHeartbeat } from './lib/hooks/usePresenceHeartbeat'
import { exportRedactedPdf } from './lib/pdf/exportRedactedPdf'
import type { AppRoute } from './navigation/routes'
import { AnnotationsPage } from './pages/AnnotationsPage'
import { BatchPage } from './pages/BatchPage'
import { ConflictsPage } from './pages/ConflictsPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { TeamsPage } from './pages/TeamsPage'
import { WorkspacePage } from './pages/WorkspacePage'
import { toRedactionExportBox } from './types/redaction'

function initialsFromEmail(email: string): string {
  const local = (email.split('@')[0] ?? email).replace(/[^a-zA-Z0-9]/g, '')
  if (local.length >= 2) return local.slice(0, 2).toUpperCase()
  const alnum = email.replace(/[^a-zA-Z0-9]/g, '')
  if (alnum.length >= 2) return alnum.slice(0, 2).toUpperCase()
  const first = email[0]
  return first ? first.toUpperCase() : '?'
}

type SessionPayload = {
  email: string
  preferredUploadGroupId: Id<'groups'> | null
}

function AuthenticatedApp({ sessionToken }: { sessionToken: string }) {
  const session = useQuery(api.session.getSession, { sessionToken })

  if (session === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-on-surface-variant">
        Loading session…
      </div>
    )
  }

  if (session === null) {
    clearStoredSessionToken()
    return <EmailGate />
  }

  return <MainApp sessionToken={sessionToken} session={session} />
}

function MainApp({
  sessionToken,
  session,
}: {
  sessionToken: string
  session: SessionPayload
}) {
  const userEmail = session.email
  const activeGroupId = session.preferredUploadGroupId

  const [route, setRoute] = useState<AppRoute>('workspace')
  const [localPdfUrl, setLocalPdfUrl] = useState<string | undefined>(undefined)
  const [documentId, setDocumentId] = useState<Id<'documents'> | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [addMemberEmail, setAddMemberEmail] = useState('')
  const [memberFeedback, setMemberFeedback] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const convexReady = isConvexConfigured()

  const myGroups = useQuery(api.groups.listMyGroups, convexReady ? { sessionToken } : 'skip')
  const accessibleDocs = useQuery(api.documents.listAccessible, convexReady ? { sessionToken } : 'skip')

  const selectedDoc = useQuery(
    api.documents.get,
    convexReady && documentId ? { documentId, sessionToken } : 'skip',
  )
  const pdfStorageUrl = useQuery(
    api.documents.getFileUrl,
    convexReady && selectedDoc ? { storageId: selectedDoc.storageId, sessionToken } : 'skip',
  )

  const rawBoxes = useQuery(
    api.redactions.listByDocument,
    convexReady && documentId ? { documentId, sessionToken } : 'skip',
  )

  const presenceRows = useQuery(
    api.presence.listPresentInDocument,
    convexReady && documentId ? { documentId, sessionToken } : 'skip',
  )

  const membersForActiveGroup = useQuery(
    api.groups.listMembers,
    convexReady && activeGroupId ? { groupId: activeGroupId, sessionToken } : 'skip',
  )

  const setPreferredUploadGroup = useMutation(api.session.setPreferredUploadGroup)

  const createGroup = useMutation(api.groups.create)
  const addMember = useMutation(api.groups.addMember)
  const removeMember = useMutation(api.groups.removeMember)
  const createBox = useMutation(api.redactions.createBox)
  const updateBox = useMutation(api.redactions.updateBox)
  const deleteBox = useMutation(api.redactions.deleteBox)

  const { uploadPdf, uploading, error: uploadError } = useDocumentUpload(
    sessionToken,
    activeGroupId ?? undefined,
  )

  usePresenceHeartbeat(convexReady ? sessionToken : null, convexReady ? documentId : null)

  const overlayBoxes: OverlayBox[] = useMemo(
    () =>
      (rawBoxes ?? []).map((b) => ({
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
      })),
    [rawBoxes],
  )

  const pdfUrl =
    documentId && pdfStorageUrl !== undefined ? pdfStorageUrl ?? undefined : localPdfUrl

  const collaborators = useMemo(
    () =>
      (presenceRows ?? [])
        .filter((p) => p.userId !== userEmail)
        .map((p) => ({
          userId: p.userId,
          displayName: p.displayName,
          color: p.color,
        })),
    [presenceRows, userEmail],
  )

  const draftCount = overlayBoxes.filter((b) => b.status === 'draft').length
  const activeGroupMeta = myGroups?.find(({ group }) => group._id === activeGroupId)
  const isGroupAdmin = activeGroupMeta?.role === 'admin'

  const setGroupScope = useCallback(
    async (id: string | null) => {
      await setPreferredUploadGroup({
        sessionToken,
        scope: id === null ? 'personal' : (id as Id<'groups'>),
      })
    },
    [sessionToken, setPreferredUploadGroup],
  )

  const onAddDocument = () => fileInputRef.current?.click()

  const onFile = async (f: FileList | null) => {
    const file = f?.[0]
    if (!file) return

    if (!convexReady) {
      setLocalPdfUrl(URL.createObjectURL(file))
      setDocumentId(null)
      setRoute('workspace')
      return
    }

    const id = await uploadPdf(file)
    if (id) {
      setDocumentId(id)
      setLocalPdfUrl(undefined)
      setRoute('workspace')
    }
  }

  const selectConvexDoc = (id: Id<'documents'>) => {
    setDocumentId(id)
    setLocalPdfUrl(undefined)
    setRoute('workspace')
  }

  const workspaceTitle =
    activeGroupId === null
      ? 'Personal workspace'
      : myGroups?.find(({ group }) => group._id === activeGroupId)?.group.name ?? 'Team workspace'

  const sidebarBadgeLabel = String(accessibleDocs?.length ?? 0)

  const onCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newGroupName.trim()
    if (!name || !convexReady) return
    await createGroup({ name, sessionToken })
    setNewGroupName('')
  }

  const onAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGroupId || !convexReady) return
    setMemberFeedback(null)
    try {
      await addMember({
        groupId: activeGroupId,
        targetEmail: addMemberEmail.trim(),
        sessionToken,
      })
      setAddMemberEmail('')
    } catch (err) {
      setMemberFeedback(err instanceof Error ? err.message : 'Failed')
    }
  }

  const onCreateBox = useCallback(
    async (
      pageNumber: number,
      rect: { x: number; y: number; width: number; height: number },
    ) => {
      if (!documentId || !convexReady) return
      await createBox({
        documentId,
        pageNumber,
        ...rect,
        sessionToken,
        status: 'draft',
      })
    },
    [convexReady, createBox, documentId, sessionToken],
  )

  const onLockBox = useCallback(
    async (boxId: string) => {
      await updateBox({
        boxId: boxId as Id<'redactionBoxes'>,
        sessionToken,
        status: 'locked',
      })
    },
    [updateBox, sessionToken],
  )

  const onDeleteBox = useCallback(
    async (boxId: string) => {
      await deleteBox({ boxId: boxId as Id<'redactionBoxes'>, sessionToken })
    },
    [deleteBox, sessionToken],
  )

  const onExport = async () => {
    if (!pdfUrl) return
    try {
      const bytes = await fetch(pdfUrl).then((r) => r.arrayBuffer())
      const byPage = new Map<number, ReturnType<typeof toRedactionExportBox>[]>()
      for (const box of overlayBoxes) {
        const list = byPage.get(box.pageNumber ?? 1) ?? []
        list.push(toRedactionExportBox(box))
        byPage.set(box.pageNumber ?? 1, list)
      }
      const pages = [...byPage.entries()].map(([pageNumber, boxes]) => ({
        pageIndex: pageNumber - 1,
        boxes,
      }))
      const out = await exportRedactedPdf(bytes, pages)
      const blob = new Blob([Uint8Array.from(out)], { type: 'application/pdf' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = selectedDoc?.name ? `redacted-${selectedDoc.name}` : 'redacted.pdf'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  const uploadFailureNotice =
    uploadError !== null ? (
      <div className="mb-4 rounded border border-error-container bg-error-container px-4 py-3 text-sm text-on-error-container">
        {uploadError}
      </div>
    ) : null

  const rightPanel = useMemo(() => {
    switch (route) {
      case 'workspace':
        return (
          <WorkspaceRightPanel
            collaborators={collaborators}
            draftBoxes={overlayBoxes}
            onLockBox={convexReady ? onLockBox : undefined}
            onDeleteBox={convexReady ? onDeleteBox : undefined}
          />
        )
      case 'dashboard':
        return (
          <SimpleRightPanel
            title="Dashboard"
            description="Document and redaction summaries come from Convex. Use the table to open a file in Workspace."
          />
        )
      case 'conflicts':
        return (
          <SimpleRightPanel
            title="Draft review"
            description="Draft redaction boxes need to be finalized in Workspace — lock yours or adjust before export."
          />
        )
      case 'annotations':
        return (
          <SimpleRightPanel
            title="Audit log"
            description="Recent redaction box events are listed in the main area from your Convex-backed activity feed."
          />
        )
      case 'batch':
        return (
          <SimpleRightPanel
            title="Summary"
            description="Totals and the queue mirror your accessible documents from Convex."
          />
        )
      case 'team':
        return (
          <SimpleRightPanel
            title="Teams"
            description="Set where uploads go and invite colleagues. Presence for the open document stays in the Workspace panel."
          />
        )
      case 'archive':
        return (
          <SimpleRightPanel title="Archive" description="Closed cases and exported productions." />
        )
      case 'settings':
        return (
          <SimpleRightPanel
            title="Settings"
            description="Manage your session email and Convex connection in the main area."
          />
        )
      default:
        return null
    }
  }, [route, collaborators, overlayBoxes, convexReady, onLockBox, onDeleteBox])

  const mainContent = useMemo(() => {
    switch (route) {
      case 'workspace':
        return (
          <WorkspacePage
            pdfUrl={pdfUrl}
            boxes={overlayBoxes}
            onCreateBox={convexReady && documentId ? onCreateBox : undefined}
          />
        )
      case 'dashboard':
        return (
          <DashboardPage sessionToken={sessionToken} onOpenDocument={selectConvexDoc} />
        )
      case 'conflicts':
        return (
          <ConflictsPage sessionToken={sessionToken} onOpenDocument={selectConvexDoc} />
        )
      case 'annotations':
        return <AnnotationsPage sessionToken={sessionToken} />
      case 'batch':
        return <BatchPage sessionToken={sessionToken} onOpenDocument={selectConvexDoc} />
      case 'team':
        return (
          <TeamsPage
            convexReady={convexReady}
            userEmail={userEmail}
            myGroups={myGroups}
            activeGroupId={activeGroupId}
            onSelectScope={setGroupScope}
            newGroupName={newGroupName}
            onNewGroupNameChange={setNewGroupName}
            onCreateGroup={onCreateGroup}
            membersForActiveGroup={membersForActiveGroup}
            isGroupAdmin={isGroupAdmin}
            addMemberEmail={addMemberEmail}
            onAddMemberEmailChange={setAddMemberEmail}
            onAddMember={onAddMember}
            memberFeedback={memberFeedback}
            onRemoveMember={(targetEmail) => {
              if (!activeGroupId) return
              void removeMember({
                groupId: activeGroupId,
                targetEmail,
                sessionToken,
              })
            }}
          />
        )
      case 'archive':
        return (
          <div className="mx-auto max-w-xl py-16 text-center">
            <h2 className="text-lg font-semibold text-on-surface">Archive</h2>
            <p className="mt-2 text-sm text-on-surface-variant">No archive workflow is configured in this app yet.</p>
          </div>
        )
      case 'settings':
        return <SettingsPage userEmail={userEmail} sessionToken={sessionToken} />
      default:
        return null
    }
  }, [
    route,
    pdfUrl,
    overlayBoxes,
    convexReady,
    documentId,
    onCreateBox,
    activeGroupId,
    myGroups,
    membersForActiveGroup,
    isGroupAdmin,
    userEmail,
    newGroupName,
    addMemberEmail,
    memberFeedback,
    sessionToken,
    onCreateGroup,
    onAddMember,
    removeMember,
    setGroupScope,
  ])

  return (
    <AppShell
      route={route}
      onNavigate={setRoute}
      rightPanel={rightPanel}
      documents={accessibleDocs}
      activeDocumentId={documentId}
      onSelectDocument={selectConvexDoc}
      onAddDocument={onAddDocument}
      uploading={uploading}
      draftCount={draftCount}
      workspaceTitle={workspaceTitle}
      workspaceSubtitle={userEmail.split('@')[0] ?? userEmail}
      badgeLabel={sidebarBadgeLabel}
      onExportClick={onExport}
      onTopBarSettingsClick={() => setRoute('settings')}
      userInitials={initialsFromEmail(userEmail)}
      mainNotice={uploadFailureNotice}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => void onFile(e.target.files)}
      />
      {mainContent}
    </AppShell>
  )
}

function App() {
  const convexReady = isConvexConfigured()
  const token = typeof window !== 'undefined' ? getStoredSessionToken() : null

  if (!convexReady) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="max-w-md text-center text-sm text-amber-800">
          Set <code className="rounded bg-amber-50 px-1">VITE_CONVEX_URL</code> in{' '}
          <code className="rounded bg-amber-50 px-1">.env.local</code> and run{' '}
          <code className="rounded bg-amber-50 px-1">npx convex dev</code>.
        </p>
        {token ? (
          <button
            type="button"
            className="text-sm underline text-zinc-600"
            onClick={() => {
              clearStoredSessionToken()
              window.location.reload()
            }}
          >
            Clear stored session and retry
          </button>
        ) : null}
      </div>
    )
  }

  if (!token) {
    return <EmailGate />
  }

  return <AuthenticatedApp sessionToken={token} />
}

export default App
