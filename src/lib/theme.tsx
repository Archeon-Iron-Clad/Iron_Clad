import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'iron-clad-theme'

export type ThemePreference = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  preference: ThemePreference
  setPreference: (p: ThemePreference) => void
  /** Dark mode after resolving the system preference when needed. */
  isDark: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
    return 'system'
  } catch {
    return 'system'
  }
}

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference)
  const [systemDark, setSystemDark] = useState(getSystemDark)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedDark =
    preference === 'dark' ? true : preference === 'light' ? false : systemDark

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedDark)
    try {
      window.localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [preference, resolvedDark])

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p)
  }, [])

  const toggleDarkMode = useCallback(() => {
    setPreferenceState((prev) => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const darkNow = prev === 'dark' ? true : prev === 'light' ? false : mq.matches
      return darkNow ? 'light' : 'dark'
    })
  }, [])

  const value = useMemo(
    () => ({ preference, setPreference, isDark: resolvedDark, toggleDarkMode }),
    [preference, resolvedDark, setPreference, toggleDarkMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
