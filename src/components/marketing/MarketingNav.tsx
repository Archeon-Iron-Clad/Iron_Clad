import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { IronCladLogo } from '../branding/IronCladLogo'
import { scrollToId } from '../../lib/scrollTo'

const LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Team', id: 'team' },
] as const

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setMenuOpen(false)
    scrollToId(id)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 marketing-glass transition-[padding] duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <button
          type="button"
          onClick={() => go('home')}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0"
          aria-label="Iron Clad home"
        >
          <IronCladLogo imgClassName="max-h-9 invert" />
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map(({ label, id }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => go(id)}
                className="text-sm font-medium text-white/75 transition hover:text-white"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => go('signup')}
          className="hidden rounded-full bg-[#0051d5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0051d5]/30 transition hover:bg-[#316bf3] md:inline-flex"
        >
          Sign up
        </motion.button>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2 text-white md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="material-symbols-outlined text-2xl">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[#0c1218]/95 px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {LINKS.map(({ label, id }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  className="w-full py-2 text-left text-sm font-medium text-white/85"
                >
                  {label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => go('signup')}
                className="mt-2 w-full rounded-full bg-[#0051d5] py-3 text-sm font-semibold text-white"
              >
                Sign up
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </motion.header>
  )
}
