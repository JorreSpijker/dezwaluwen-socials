import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { fetchMatches, ownTeams } from './api/korfbal.js'
import { today, nextWeek, oneWeekAgo, thisWeek } from './lib/dates.js'
import { exportPng } from './lib/export.js'
import { slug } from './lib/slug.js'
import {
  CLUBS,
  CUSTOM_ID,
  loadCustom,
  loadSelectedId,
  saveCustom,
  saveSelectedId,
} from './config/club.js'
import Tabs from './components/Tabs.jsx'
import Controls from './components/Controls.jsx'
import ClubSelector from './components/ClubSelector.jsx'
import ClubSettings from './components/ClubSettings.jsx'
import StoryCanvas from './components/StoryCanvas.jsx'

const defaultRange = (tab) =>
  tab === 'results' ? [oneWeekAgo(), today()] : [today(), nextWeek()]

export default function App() {
  const [tab, setTab] = useState('program')
  const [clubId, setClubId] = useState(loadSelectedId)
  const [custom, setCustom] = useState(loadCustom)
  const [[dateFrom, dateTo], setRange] = useState(() => defaultRange('program'))
  const [data, setData] = useState({ matches: [], raw: [] })
  const [hiddenTeams, setHiddenTeams] = useState(() => new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const canvasRef = useRef(null)

  // De preview schaalt mee met de beschikbare breedte, zodat de story op een
  // telefoon volledig past zonder horizontaal scrollen.
  const frameRef = useRef(null)
  const [scale, setScale] = useState(0.3)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1080)
    })
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [])

  const club = useMemo(
    () =>
      clubId === CUSTOM_ID ? custom : (CLUBS.find((c) => c.id === clubId) ?? CLUBS[0]),
    [clubId, custom],
  )

  useEffect(() => {
    if (!dateFrom || !dateTo) return
    if (!club.clubCode) {
      setData({ matches: [], raw: [] })
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMatches(tab, dateFrom, dateTo, club.clubCode)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setHiddenTeams(new Set())
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [tab, dateFrom, dateTo, club.clubCode])

  const teams = useMemo(() => ownTeams(data.matches), [data.matches])

  const visible = useMemo(
    () =>
      data.matches.filter(
        (m) =>
          !(m.isHomeClub && hiddenTeams.has(m.home)) &&
          !(m.isAwayClub && hiddenTeams.has(m.away)),
      ),
    [data.matches, hiddenTeams],
  )

  const scoreless =
    tab === 'results' && data.matches.length > 0 && data.matches.every((m) => !m.score)

  function changeTab(next) {
    setTab(next)
    setRange(defaultRange(next))
  }

  function changeClub(next) {
    setClubId(next)
    saveSelectedId(next)
    setError(null)
  }

  function changeCustom(next) {
    setCustom(next)
    try {
      saveCustom(next)
    } catch (err) {
      setError(err.message)
    }
  }

  function toggleTeam(team) {
    setHiddenTeams((prev) => {
      const next = new Set(prev)
      next.has(team) ? next.delete(team) : next.add(team)
      return next
    })
  }

  async function handleExport() {
    setExporting(true)
    try {
      const name = tab === 'results' ? 'uitslagen' : 'programma'
      await exportPng(canvasRef.current, `${slug(club.name)}-${name}-${dateFrom}.png`)
    } catch (err) {
      setError(`Export mislukt: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-32 lg:grid-cols-[20rem_1fr] lg:gap-10 lg:px-8 lg:pb-10">
        <div className="order-1 min-w-0 space-y-4 lg:order-none lg:col-start-1 lg:row-start-1">
          <h1 className="text-xl font-bold text-slate-900 sr-only">Korfbal socials</h1>
          <ClubSelector clubId={clubId} onChange={changeClub} />
          {/* Direct onder de selector: op mobiel staat de preview er anders
              tussen en moet je een schermlengte scrollen na het kiezen. */}
          {clubId === CUSTOM_ID && (
            <ClubSettings config={custom} onChange={changeCustom} onError={setError} />
          )}
          <Tabs tab={tab} onChange={changeTab} />
        </div>

        {/* Op mobiel staat de preview onder de bediening (order-3), op desktop
            bepaalt de expliciete grid-plaatsing de volgorde. */}
        <div className="order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {/* Op desktop zo groot als de vensterhoogte toelaat (story is 9:16). */}
          <div
            ref={frameRef}
            className="mx-auto w-full max-w-[420px] overflow-hidden bg-white shadow-lg lg:mx-0 lg:w-[min(100%,calc((100vh-7rem)/1.7778))] lg:max-w-none"
            style={{ height: 1920 * scale }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <StoryCanvas
                ref={canvasRef}
                club={club}
                kind={tab}
                matches={visible}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            </div>
          </div>
        </div>

        <div className="order-2 min-w-0 space-y-5 lg:order-none lg:col-start-1 lg:row-start-2">
          <Controls
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFrom={(v) => setRange([v, dateTo])}
            onDateTo={(v) => setRange([dateFrom, v])}
            onThisWeek={() => setRange(thisWeek())}
            teams={teams}
            hiddenTeams={hiddenTeams}
            onToggleTeam={toggleTeam}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {!club.clubCode ? (
            <p className="text-sm text-slate-500">Vul eerst een clubcode in.</p>
          ) : loading ? (
            <p className="text-sm text-slate-500">Laden…</p>
          ) : (
            !error && (
              <p className="text-sm text-slate-500">
                {visible.length} van {data.matches.length} wedstrijden zichtbaar
              </p>
            )
          )}

          {scoreless && (
            <details className="rounded-md bg-white p-3 text-xs">
              <summary className="cursor-pointer font-medium text-slate-700">
                Geen score gevonden — ruwe JSON
              </summary>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-all text-slate-600">
                {JSON.stringify(data.raw[0], null, 2)}
              </pre>
            </details>
          )}

          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
            <button
              onClick={handleExport}
              disabled={visible.length === 0 || exporting}
              className="mx-auto block w-full max-w-lg rounded-lg bg-[#0b2545] px-4 py-4 text-base font-semibold text-white disabled:opacity-40 lg:max-w-none lg:py-3"
            >
              {exporting ? 'Bezig…' : 'Deel of download PNG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
