import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { PAGES, pagePath } from '../lib/pages.js'

/**
 * Vanaf lg een vaste kolom links, in te klappen tot alleen de iconen; de naam
 * staat dan in de tooltip. Op mobiel een drawer die over de pagina schuift,
 * altijd uitgeklapt, en dichtgaat zodra er een item gekozen is.
 */
export default function Menu({ current, open, onClose, collapsed, onCollapse }) {
  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"></div>
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-white p-3 shadow-xl transition-[translate,width] lg:sticky lg:top-14 lg:z-auto lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:border-r lg:border-slate-200 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[4.25rem]' : 'lg:w-56'}`}
      >
        <ul className="flex-1 space-y-1 overflow-y-auto">
          {PAGES.map((page) => (
            <li key={page.id}>
              <a
                href={pagePath(page.id)}
                onClick={onClose}
                title={collapsed ? page.label : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  current === page.id
                    ? 'bg-slate-100 text-club'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <page.icon className="size-5 shrink-0" aria-hidden="true" />
                <span className={`truncate ${collapsed ? 'lg:sr-only' : ''}`}>{page.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={onCollapse}
          title={collapsed ? 'Menu uitklappen' : 'Menu inklappen'}
          className="mt-2 hidden min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5 shrink-0" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-5 shrink-0" aria-hidden="true" />
          )}
          <span className={collapsed ? 'sr-only' : ''}>
            {collapsed ? 'Menu uitklappen' : 'Menu inklappen'}
          </span>
        </button>
      </nav>
    </>
  )
}
