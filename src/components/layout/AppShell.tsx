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
  draftCount?: number
  onExportPreview?: () => void
  onExportRelease?: () => void
  exportDisabled?: boolean
  onTopBarSettingsClick?: () => void
  /** Profile avatar opens the same settings area. */
  onProfileClick?: () => void
  userInitials: string
  mainNotice?: ReactNode
  onNavigateToCases?: () => void
  onNavigateToCreateCase?: () => void
  thumbnailsCasePanelActive?: boolean
  thumbnailsCaseName?: string
  thumbnailsPdfSectionTitle?: string
  thumbnailsScopeKindLabel?: string
  /** When the active scope is a case created from a Team roster. */
  thumbnailsAllocatedTeamName?: string | null
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
  draftCount,
  onExportPreview,
  onExportRelease,
  exportDisabled,
  onTopBarSettingsClick,
  onProfileClick,
  userInitials,
  mainNotice,
  onNavigateToCases,
  onNavigateToCreateCase,
  thumbnailsCasePanelActive = false,
  thumbnailsCaseName,
  thumbnailsPdfSectionTitle = 'Shared PDFs',
  thumbnailsScopeKindLabel = 'Workspace',
  thumbnailsAllocatedTeamName,
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
        onProfileClick={onProfileClick}
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
        draftCount={draftCount}
        onNavigateToCases={onNavigateToCases}
        onNavigateToCreateCase={onNavigateToCreateCase}
        thumbnailsCasePanelActive={thumbnailsCasePanelActive}
        thumbnailsCaseName={thumbnailsCaseName}
        thumbnailsPdfSectionTitle={thumbnailsPdfSectionTitle}
        thumbnailsScopeKindLabel={thumbnailsScopeKindLabel}
        thumbnailsAllocatedTeamName={thumbnailsAllocatedTeamName}
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
