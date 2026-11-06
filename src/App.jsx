import { useEffect, useState } from 'react'
import { PAGES, pagePath } from './lib/pages.js'
import Header from './components/Header.jsx'
import Menu from './components/Menu.jsx'
import BallSponsor from './pages/BallSponsor.jsx'
import Home from './pages/Home.jsx'
import Introduction from './pages/Introduction.jsx'
import Matches from './pages/Matches.jsx'
import News from './pages/News.jsx'
import Placeholder from './pages/Placeholder.jsx'
import Spotlight from './pages/Spotlight.jsx'
import TeamOfWeek from './pages/TeamOfWeek.jsx'

// Oude links met #/<id> blijven werken: die worden omgezet naar /<id>.
if (location.hash.startsWith('#/')) history.replaceState(null, '', pagePath(location.hash.slice(2)))

// Een onbekend pad valt terug op het eerste menu-item: home.
const currentPage = () =>
  PAGES.find((page) => pagePath(page.id) === location.pathname) ?? PAGES[0]

export default function App() {
  const [page, setPage] = useState(currentPage)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Interne links wisselen van pagina zonder herladen. /auth/ (uitloggen)
  // moet wel naar de server, en een klik met modifier opent gewoon een tab.
  useEffect(() => {
    const onPopState = () => setPage(currentPage())
    const onClick = (e) => {
      const href = e.target.closest('a')?.getAttribute('href')
      if (!href?.startsWith('/') || href.startsWith('/auth/')) return
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      history.pushState(null, '', href)
      setPage(currentPage())
    }
    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100">
      <Header title={page.label} onMenu={() => setMenuOpen(true)} />
      <div className="lg:flex">
        <Menu
          current={page.id}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="min-w-0 flex-1">
          {page.id === 'home' && <Home />}
          {page.id === 'programma' && <Matches key="program" kind="program" />}
          {page.id === 'uitslagen' && <Matches key="results" kind="results" />}
          {page.id === 'team-van-de-week' && <TeamOfWeek />}
          {page.id === 'balsponsor' && <BallSponsor />}
          {page.id === 'laatste-nieuws' && <News />}
          {page.id === 'sponsor-in-de-spotlight' && <Spotlight />}
          {page.id === 'voorstelrondje' && <Introduction />}
          {!page.ready && <Placeholder title={page.label} />}
        </main>
      </div>
    </div>
  )
}
