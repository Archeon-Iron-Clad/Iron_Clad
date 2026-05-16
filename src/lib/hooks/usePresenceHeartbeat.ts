import { useMutation } from 'convex/react'
import { useEffect } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'

const HEARTBEAT_MS = 25_000

export function usePresenceHeartbeat(
  sessionToken: string | null | undefined,
  documentId: Id<'documents'> | null,
  displayName?: string,
) {
  const heartbeat = useMutation(api.presence.heartbeat)
  const leaveDocument = useMutation(api.presence.leaveDocument)

  useEffect(() => {
    if (!sessionToken || !documentId) return

    const tick = () => {
      void heartbeat({ sessionToken, documentId, displayName })
    }
    tick()
    const id = window.setInterval(tick, HEARTBEAT_MS)
    return () => {
      window.clearInterval(id)
      void leaveDocument({ sessionToken })
    }
  }, [documentId, sessionToken, displayName, heartbeat, leaveDocument])
}
