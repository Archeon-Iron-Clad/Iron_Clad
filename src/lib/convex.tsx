import { ConvexAuthProvider } from '@convex-dev/auth/react'
import type { ReactNode } from 'react'

import { convexClient } from './convexClient'

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convexClient}>{children}</ConvexAuthProvider>
}
