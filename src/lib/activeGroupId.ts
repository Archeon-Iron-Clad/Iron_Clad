const KEY = 'ironclad-active-group-id'

/** Target group for new uploads (session-only). `null` = personal documents. */
export function getStoredActiveGroupId(): string | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(KEY)
  return raw && raw.length > 0 ? raw : null
}

export function setStoredActiveGroupId(id: string | null) {
  if (typeof window === 'undefined') return
  if (id === null) sessionStorage.removeItem(KEY)
  else sessionStorage.setItem(KEY, id)
}
