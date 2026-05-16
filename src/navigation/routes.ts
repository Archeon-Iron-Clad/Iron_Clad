/** All navigable views in the app shell. */
export type AppRoute =
  | 'workspace'
  | 'dashboard'
  | 'annotations'
  | 'conflicts'
  | 'batch'
  | 'team'
  | 'cases'
  | 'archive'
  | 'settings'

export type TopNavId = 'documents' | 'team' | 'analytics' | 'archive'
export type SideNavId = 'thumbnails' | 'annotations' | 'conflicts' | 'settings'

export const TOP_NAV_ROUTES: Record<TopNavId, AppRoute> = {
  documents: 'dashboard',
  team: 'team',
  analytics: 'batch',
  archive: 'archive',
}

export const SIDE_NAV_ROUTES: Record<SideNavId, AppRoute> = {
  thumbnails: 'workspace',
  annotations: 'annotations',
  conflicts: 'conflicts',
  settings: 'settings',
}

export function topNavForRoute(route: AppRoute): TopNavId | null {
  const entry = Object.entries(TOP_NAV_ROUTES).find(([, r]) => r === route)
  return entry ? (entry[0] as TopNavId) : null
}

export function sideNavForRoute(route: AppRoute): SideNavId | null {
  const entry = Object.entries(SIDE_NAV_ROUTES).find(([, r]) => r === route)
  return entry ? (entry[0] as SideNavId) : null
}
