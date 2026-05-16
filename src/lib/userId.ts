const STORAGE_KEY = 'iron-clad-user-id'

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `u_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
}

/** Stable per-browser id for attributing redactions / presence (replace with auth post-hackathon). */
export function getOrCreateLocalUserId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const id = randomId()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    return randomId()
  }
}
