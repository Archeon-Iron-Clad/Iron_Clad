import { Icon } from '../../ui/Icon'

const CODES = [
  { group: 'PRIVACY & PII', items: [{ name: 'Personal Privacy', dot: 'bg-secondary' }, { name: 'Medical Info', dot: 'bg-surface-container-high' }] },
  {
    group: 'CORPORATE & LEGAL',
    items: [
      { name: 'Trade Secret', dot: 'bg-secondary', active: true },
      { name: 'Attorney-Client', dot: 'bg-tertiary-container' },
    ],
  },
  {
    group: 'GOVERNMENT',
    items: [
      { name: 'National Security', dot: 'bg-error' },
      { name: 'Law Enforcement', dot: 'bg-outline' },
    ],
  },
]

export function AnnotationsRightPanel() {
  return (
    <aside className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-l border-outline-variant bg-surface-bright">
      <div className="flex items-center justify-between border-b border-outline-variant p-4">
        <h3 className="text-base font-semibold">Exemption Codes</h3>
        <button type="button" className="rounded p-1 hover:bg-surface-container-high" aria-label="Add code">
          <Icon name="add" />
        </button>
      </div>
      <div className="border-b border-outline-variant p-3">
        <div className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-low px-3 py-2">
          <Icon name="search" className="text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Filter codes..."
            className="flex-1 border-none bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {CODES.map((section) => (
          <div key={section.group} className="mb-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {section.group}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-xs ${
                      item.active
                        ? 'bg-secondary-container font-semibold text-on-secondary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className={`size-2 rounded-full ${item.dot}`} />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant bg-surface-container-low p-3 text-[10px] text-on-surface-variant">
        Tip: Use Ctrl + 1-9 to quickly assign frequent codes.
      </div>
    </aside>
  )
}
