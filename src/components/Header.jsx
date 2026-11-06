import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'

export default function Header({ title, onMenu }) {
  const [user, setUser] = useState(null)

  // Lokaal via Vite draait de middleware niet; dan geeft /auth/me geen JSON.
  useEffect(() => {
    fetch('/auth/me')
      .then((res) => res.json())
      .then(setUser)
      .catch(() => {})
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenu}
        aria-label="Menu openen"
        className="-ml-2 flex size-11 items-center justify-center rounded-md text-slate-700 lg:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <a href="/" className="flex items-center gap-3">
        <img src="/logo.svg" alt="" className="h-8 w-auto" />
        <h1 className="text-base font-bold text-club">
          De Zwaluwen <span className="font-medium text-slate-500">socials</span>
        </h1>
      </a>
      <span className="ml-auto truncate text-sm font-medium text-slate-700 lg:ml-6 lg:border-l lg:border-slate-200 lg:pl-6">
        {title}
      </span>
      {user?.email && (
        <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3 lg:ml-auto lg:pl-6">
          {/* Zonder no-referrer weigert Google de foto soms. */}
          {user.picture && (
            <img
              src={user.picture}
              alt=""
              referrerPolicy="no-referrer"
              className="size-8 shrink-0 rounded-full"
            />
          )}
          <span className="hidden truncate text-sm text-slate-500 sm:inline">{user.email}</span>
          <a
            href="/auth/logout"
            aria-label="Uitloggen"
            title="Uitloggen"
            className="-mr-2 flex size-11 items-center justify-center rounded-md text-slate-700 hover:text-club"
          >
            <LogOut size={20} />
          </a>
        </div>
      )}
    </header>
  )
}
