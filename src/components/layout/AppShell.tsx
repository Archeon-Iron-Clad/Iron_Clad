import type { ReactNode } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import type { AppRoute } from '../../navigation/routes'
import { SIDE_NAV_ROUTES, TOP_NAV_ROUTES, sideNavForRoute, topNavForRoute } from '../../navigation/routes'
import { LeftSidebar } from './LeftSidebar'
import { TopAppBar } from './TopAppBar'
import type { TopNavId, SideNavId } from '../../navigation/routes'

type DocumentRow = { _id: Id<'documents'>; name: string; createdAt: number }

type Props = {
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  rightPanel: ReactNode
  children: ReactNode
  documents?: DocumentRow[]
  activeDocumentId: Id<'documents'> | null
  onSelectDocument: (id: Id<'documents'>) => void
  onRenameDocument?: (id: Id<'documents'>, name: string) => void
  onDeleteDocument?: (id: Id<'documents'>) => void
  onAddDocument: () => void
  uploading?: boolean
  draftCount?: number
  workspaceTitle: string
  workspaceSubtitle?: string
  badgeLabel: string
  onExportPreview?: () => void
  onExportRelease?: () => void
  exportDisabled?: boolean
  onTopBarSettingsClick?: () => void
  userInitials: string
  mainNotice?: ReactNode
  onAddCase?: () => void
  onOpenCreateCaseWizard?: () => void
  convexReady?: boolean
  thumbnailsCasePanelActive?: boolean
  thumbnailsCaseName?: string
  onAddThumbnailsDocument?: () => void
  thumbnailsAddDocumentBusy?: boolean
  thumbnailsAddDocumentDisabled?: boolean
}

export function AppShell({
  route,
  onNavigate,
  rightPanel,
  children,
  documents,
  activeDocumentId,
  onSelectDocument,
  onRenameDocument,
  onDeleteDocument,
  onAddDocument,
  uploading,
  draftCount,
  workspaceTitle,
  workspaceSubtitle,
  badgeLabel,
  onExportPreview,
  onExportRelease,
  exportDisabled,
  onTopBarSettingsClick,
  userInitials,
  mainNotice,
  onAddCase,
  onOpenCreateCaseWizard,
  convexReady = false,
  thumbnailsCasePanelActive = false,
  thumbnailsCaseName,
  onAddThumbnailsDocument,
  thumbnailsAddDocumentBusy,
  thumbnailsAddDocumentDisabled,
}: Props) {
  const activeTopNav = topNavForRoute(route)
  const activeSideNav = sideNavForRoute(route)

  const handleTopNav = (nav: TopNavId) => onNavigate(TOP_NAV_ROUTES[nav])
  const handleSideNav = (nav: SideNavId) => onNavigate(SIDE_NAV_ROUTES[nav])

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar
        activeNav={activeTopNav}
        onNavClick={handleTopNav}
        onExportPreview={onExportPreview}
        onExportRelease={onExportRelease}
        exportDisabled={exportDisabled}
        onSettingsClick={onTopBarSettingsClick}
        userInitials={userInitials}
      />
      <LeftSidebar
        activeSideNav={activeSideNav}
        onSideNavClick={handleSideNav}
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelectDocument={onSelectDocument}
        onRenameDocument={onRenameDocument}
        onDeleteDocument={onDeleteDocument}
        onAddDocument={onAddDocument}
        uploading={uploading}
        draftCount={draftCount}
        workspaceTitle={workspaceTitle}
        workspaceSubtitle={workspaceSubtitle}
        badgeLabel={badgeLabel}
        onAddCase={onAddCase}
        onOpenCreateCaseWizard={onOpenCreateCaseWizard}
        convexReady={convexReady}
        thumbnailsCasePanelActive={thumbnailsCasePanelActive}
        thumbnailsCaseName={thumbnailsCaseName}
        onAddThumbnailsDocument={onAddThumbnailsDocument}
        thumbnailsAddDocumentBusy={thumbnailsAddDocumentBusy}
        thumbnailsAddDocumentDisabled={thumbnailsAddDocumentDisabled}
      />
      {rightPanel}
      <main className="fixed bottom-0 left-64 right-80 top-14 overflow-auto bg-surface-dim p-gutter">
        {mainNotice}
        {children}
      </main>
    </div>
  )
}
