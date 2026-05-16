import { ConvexReactClient } from 'convex/react'

const url = import.meta.env.VITE_CONVEX_URL

export const convexClient = new ConvexReactClient(url ?? '')

export function isConvexConfigured(): boolean {
  return typeof url === 'string' && url.length > 0
}
