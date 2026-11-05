import { useEffect, useState } from 'react'
import { PAGES } from './lib/pages.js'
import Header from './components/Header.jsx'
import Menu from './components/Menu.jsx'
import Home from './pages/Home.jsx'
import Matches from './pages/Matches.jsx'
import News from './pages/News.jsx'
import Placeholder from './pages/Placeholder.jsx'
import TeamOfWeek from './pages/TeamOfWeek.jsx'

// Een onbekend of leeg hash-pad valt terug op het eerste menu-item: home.
const currentPage = () =>
  PAGES.find((page) => `#/${page.id}` === location.hash) ?? PAGES[0]

export default function App() {
  const [page, setPage] = useState(currentPage)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const onHashChange = () => setPage(currentPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
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
          {page.id === 'laatste-nieuws' && <News />}
          {!page.ready && <Placeholder title={page.label} />}
        </main>
      </div>
    </div>
  )
}
