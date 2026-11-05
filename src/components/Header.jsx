export default function Header({ title, onMenu }) {
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
      <a href="#/home" className="flex items-center gap-3">
        <img src="/logo.svg" alt="" className="h-8 w-auto" />
        <h1 className="text-base font-bold text-club">
          De Zwaluwen <span className="font-medium text-slate-500">socials</span>
        </h1>
      </a>
      <span className="ml-auto truncate text-sm font-medium text-slate-700 lg:ml-6 lg:border-l lg:border-slate-200 lg:pl-6">
        {title}
      </span>
    </header>
  )
}
