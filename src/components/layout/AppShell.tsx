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
  onAddDocument: () => void
  uploading?: boolean
  draftCount?: number
  workspaceTitle: string
  workspaceSubtitle?: string
  badgeLabel: string
  onExportClick?: () => void
  /** Top-bar settings control opens this route area. */
  onTopBarSettingsClick?: () => void
  /** Two-letter initials for the session user (shown in header). */
  userInitials: string
  /** Optional notices above routed page content (e.g. upload failures). */
  mainNotice?: ReactNode
}

export function AppShell({
  route,
  onNavigate,
  rightPanel,
  children,
  documents,
  activeDocumentId,
  onSelectDocument,
  onAddDocument,
  uploading,
  draftCount,
  workspaceTitle,
  workspaceSubtitle,
  badgeLabel,
  onExportClick,
  onTopBarSettingsClick,
  userInitials,
  mainNotice,
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
        onExportClick={onExportClick}
        onSettingsClick={onTopBarSettingsClick}
        userInitials={userInitials}
      />
      <LeftSidebar
        activeSideNav={activeSideNav}
        onSideNavClick={handleSideNav}
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelectDocument={onSelectDocument}
        onAddDocument={onAddDocument}
        uploading={uploading}
        draftCount={draftCount}
        workspaceTitle={workspaceTitle}
        workspaceSubtitle={workspaceSubtitle}
        badgeLabel={badgeLabel}
      />
      {rightPanel}
      <main className="fixed bottom-0 left-64 right-80 top-14 overflow-auto bg-surface-dim p-gutter">
        {mainNotice}
        {children}
      </main>
    </div>
  )
}
