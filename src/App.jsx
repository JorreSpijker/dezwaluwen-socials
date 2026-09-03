import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { fetchMatches } from './api/korfbal.js'
import {
  today,
  nextWeek,
  oneWeekAgo,
  thisWeek,
  formatRange,
  formatDayKey,
  parseDateTime,
} from './lib/dates.js'
import { groupByDay, paginate } from './lib/paginate.js'
import { applyOrder, moveWithinDay } from './lib/order.js'
import { clearState, loadState, saveState } from './lib/storage.js'
import { exportPng } from './lib/export.js'
import Tabs from './components/Tabs.jsx'
import Controls from './components/Controls.jsx'
import MatchOrder from './components/MatchOrder.jsx'
import MatchDialog from './components/MatchDialog.jsx'
import StoryCanvas from './components/StoryCanvas.jsx'

const defaultRange = (tab) =>
  tab === 'results' ? [oneWeekAgo(), today()] : [today(), nextWeek()]

function sameMetrics(a, b) {
  if (!a || a.list !== b.list || a.header !== b.header || a.rows.size !== b.rows.size) return false
  for (const [id, height] of b.rows) if (a.rows.get(id) !== height) return false
  return true
}

export default function App() {
  const [tab, setTab] = useState('program')
  const [[dateFrom, dateTo], setRange] = useState(() => defaultRange('program'))
  const [data, setData] = useState({ matches: [], raw: [] })
  // Eén keer uitlezen, daarna houden de drie stukken zichzelf bij.
  const [stored] = useState(loadState)
  const [hidden, setHidden] = useState(stored.hidden)
  const [added, setAdded] = useState(stored.matches)
  const [order, setOrder] = useState(stored.order)
  // null = dicht, 'new' = toevoegen, een wedstrijd = bewerken.
  const [dialog, setDialog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const canvasRefs = useRef([])

  // De rijen staan op vaste grootte. Een verborgen canvas met álle wedstrijden
  // meet hoe hoog ze uitvallen; daarmee worden ze over zoveel story's verdeeld
  // als nodig.
  const [metrics, setMetrics] = useState(null)
  const onMeasure = useCallback((next) => {
    setMetrics((prev) => (sameMetrics(prev, next) ? prev : next))
  }, [])

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

  useEffect(() => {
    if (!dateFrom || !dateTo) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMatches(tab, dateFrom, dateTo)
      // Verborgen wedstrijden en de volgorde blijven staan over een ophaalronde
      // heen. Id's die niet meer voorkomen doen geen kwaad: ze matchen nergens
      // meer op, en applyOrder valt vanzelf terug op chronologisch.
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [tab, dateFrom, dateTo])

  useEffect(() => saveState({ matches: added, order, hidden }), [added, order, hidden])

  // Handmatig toegevoegde wedstrijden staan los van de respons, zodat een
  // nieuwe ophaalronde ze niet wist. Ze tellen alleen mee binnen het bereik
  // dat op dat moment is ingesteld.
  const addedInRange = useMemo(
    () => added.filter((m) => formatDayKey(m.date) >= dateFrom && formatDayKey(m.date) <= dateTo),
    [added, dateFrom, dateTo],
  )

  const matches = useMemo(
    () => [...data.matches, ...addedInRange].sort((a, b) => a.date - b.date),
    [data.matches, addedInRange],
  )

  const ordered = useMemo(() => applyOrder(matches, order), [matches, order])

  // De sleeplijst toont alles, ook wat verborgen is: anders valt een wedstrijd
  // niet meer terug te zetten. De story krijgt alleen wat zichtbaar staat.
  const orderedGroups = useMemo(() => groupByDay(ordered), [ordered])
  const visible = useMemo(() => ordered.filter((m) => !hidden.has(m.id)), [ordered, hidden])
  const visibleGroups = useMemo(() => groupByDay(visible), [visible])
  const pages = useMemo(() => paginate(visible, metrics), [visible, metrics])

  // Het bereik in de kop blijft op elke pagina dat van de hele selectie.
  const range = visible.length
    ? formatRange(visible[0].date, visible[visible.length - 1].date)
    : formatRange(dateFrom, dateTo)

  const scoreless =
    tab === 'results' && data.matches.length > 0 && data.matches.every((m) => !m.score)

  function changeTab(next) {
    setTab(next)
    setRange(defaultRange(next))
  }

  function saveMatch({ id, team, opponent, date, time, home, score }) {
    const match = {
      id: id ?? `custom-${Date.now()}`,
      date: parseDateTime(date, time),
      home: home ? team : opponent,
      away: home ? opponent : team,
      isHomeClub: home,
      isAwayClub: !home,
      score,
      // Onderscheidt een handmatige wedstrijd van een uit de KNKV-respons:
      // alleen de eigen wedstrijden zijn te bewerken en te verwijderen.
      custom: true,
    }

    const existing = added.find((m) => m.id === match.id)
    if (!existing) return setAdded((prev) => [...prev, match])

    // Verhuist de wedstrijd naar een andere speeldag, dan zet een handmatige
    // volgorde de dagen door elkaar en verschijnt een dagkop dubbel.
    if (formatDayKey(existing.date) !== formatDayKey(match.date)) setOrder(null)
    setAdded((prev) => prev.map((m) => (m.id === match.id ? match : m)))
  }

  function removeMatch(id) {
    setAdded((prev) => prev.filter((m) => m.id !== id))
  }

  function reorderMatch(activeId, overId) {
    const next = moveWithinDay(ordered, activeId, overId)
    if (next) setOrder(next)
  }

  function clearAll() {
    const count = added.length
    const what = count === 1 ? '1 eigen wedstrijd' : `${count} eigen wedstrijden`
    if (!window.confirm(`${what}, de volgorde en de verborgen wedstrijden wissen?`)) return
    clearState()
    setAdded([])
    setOrder(null)
    setHidden(new Set())
  }

  function toggleMatch(id) {
    setHidden((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleExport() {
    setExporting(true)
    try {
      const name = tab === 'results' ? 'uitslagen' : 'programma'
      await exportPng(canvasRefs.current.slice(0, pages.length), `zwaluwen-${name}-${dateFrom}`)
    } catch (err) {
      setError(`Export mislukt: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-32 lg:grid-cols-[20rem_1fr] lg:gap-10 lg:px-8 lg:pb-10">
        {/* Vanaf lg één zijbalk die blijft staan terwijl de preview doorloopt.
            Op mobiel is er geen zijbalk: de wrapper valt weg met display:
            contents, zodat de tabs, de preview en de instellingen los in de
            kolom staan. Hun volgorde ligt daar vast met row-start, omdat de
            preview in de DOM ná de instellingen komt. */}
        <div className="contents lg:sticky lg:top-6 lg:col-start-1 lg:row-start-1 lg:block lg:max-h-[calc(100vh-3rem)] lg:space-y-10 lg:self-start lg:overflow-y-auto">
          <div className="row-start-1 min-w-0 space-y-4">
            <h1 className="text-xl font-bold text-slate-900 sr-only">De Zwaluwen — socials</h1>
            <Tabs tab={tab} onChange={changeTab} />
          </div>

          <div className="row-start-3 min-w-0 space-y-5">
            <Controls
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFrom={(v) => setRange([v, dateTo])}
              onDateTo={(v) => setRange([dateFrom, v])}
              onThisWeek={() => setRange(thisWeek())}
            />

            <MatchOrder
              groups={orderedGroups}
              hidden={hidden}
              onToggle={toggleMatch}
              onEdit={setDialog}
              onRemove={removeMatch}
              onReorder={reorderMatch}
              onReset={() => setOrder(null)}
              reordered={ordered !== matches}
            />

            <button
              onClick={() => setDialog('new')}
              className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-base font-medium text-slate-700"
            >
              Wedstrijd toevoegen
            </button>

            <button
              onClick={clearAll}
              className="min-h-11 w-full rounded-md px-4 text-sm font-medium text-slate-500 underline underline-offset-2"
            >
              Opgeslagen gegevens wissen
            </button>

            {dialog && (
              <MatchDialog
                kind={tab}
                match={dialog === 'new' ? null : dialog}
                defaultDate={dateFrom}
                onSave={saveMatch}
                onClose={() => setDialog(null)}
              />
            )}

            {loading && <p className="text-sm text-slate-500">Laden…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <p className="text-sm text-slate-500">
                {visible.length} van {matches.length} wedstrijden zichtbaar
                {pages.length > 1 && ` — ${pages.length} afbeeldingen`}
              </p>
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

        <div className="row-start-2 min-w-0 space-y-4 lg:col-start-2 lg:row-start-1">
          {/* Op desktop zo groot als de vensterhoogte toelaat (story is 9:16). */}
          {pages.map((groups, index) => (
            <div
              key={index}
              ref={index === 0 ? frameRef : undefined}
              className="mx-auto w-full max-w-[420px] overflow-hidden bg-white shadow-lg lg:mx-0 lg:w-[min(100%,calc((100vh-7rem)/1.7778))] lg:max-w-none"
              style={{ height: 1920 * scale }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <StoryCanvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  kind={tab}
                  groups={groups}
                  range={range}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Meetcanvas: staat buiten beeld op ware grootte en levert de hoogtes
            waarmee de pagina's worden bepaald. */}
        <div className="pointer-events-none fixed top-0 left-0 -z-10 opacity-0" aria-hidden="true">
          <StoryCanvas
            kind={tab}
            groups={visibleGroups}
            range={range}
            onMeasure={onMeasure}
          />
        </div>

      </div>
    </div>
  )
}
