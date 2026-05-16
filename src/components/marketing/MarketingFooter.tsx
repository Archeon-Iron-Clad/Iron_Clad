import { IronCladLogo } from '../branding/IronCladLogo'
import { scrollToId } from '../../lib/scrollTo'

const FOOTER_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Team', id: 'team' },
  { label: 'Sign up', id: 'signup' },
] as const

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <IronCladLogo imgClassName="max-h-8 invert" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Real-time collaborative visual PDF redaction for teams who demand precision.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {FOOTER_LINKS.map(({ label, id }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(id)}
                    className="text-sm text-white/55 transition hover:text-white"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-white/10 pt-8 text-center text-xs text-white/35 sm:text-left">
          © {year} Iron Clad. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
