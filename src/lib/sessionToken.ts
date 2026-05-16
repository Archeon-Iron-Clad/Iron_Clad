/** Opaque Convex session bearer; canonical email stored server-side. */
const KEY = 'iron-clad-session-token'

export function getStoredSessionToken(): string | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY)?.trim()
  return raw && raw.length > 0 ? raw : null
}

export function setStoredSessionToken(token: string): void {
  localStorage.setItem(KEY, token.trim())
}

export function clearStoredSessionToken(): void {
  localStorage.removeItem(KEY)
}
