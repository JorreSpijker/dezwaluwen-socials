import { useEffect, useState } from 'react'
import { fetchMatches } from '../api/korfbal.js'
import { formatDayHeader, formatTime, thisWeek } from '../lib/dates.js'
import { groupByDay } from '../lib/paginate.js'
import { PAGES, pagePath } from '../lib/pages.js'

// Eigen team vet, zoals op de afbeeldingen.
function Teams({ match }) {
  return (
    <span className="min-w-0 flex-1 text-slate-600">
      <span className={match.isHomeClub ? 'font-semibold text-slate-900' : ''}>{match.home}</span>
      {' – '}
      <span className={match.isAwayClub ? 'font-semibold text-slate-900' : ''}>{match.away}</span>
    </span>
  )
}

function WeekList({ title, kind }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const [from, to] = thisWeek()
    fetchMatches(kind, from, to)
      .then((result) => !cancelled && setMatches(result.matches))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [kind])

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {loading && <p className="mt-3 text-sm text-slate-500">Laden…</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">Geen wedstrijden deze week.</p>
      )}
      <div className="mt-3 space-y-4">
        {groupByDay(matches).map((group) => (
          <div key={group.key}>
            <h3 className="text-xs font-semibold tracking-wide text-club uppercase">
              {formatDayHeader(group.date)}
            </h3>
            <ul className="mt-1 divide-y divide-slate-100">
              {group.matches.map((match) => (
                <li key={match.id} className="flex gap-3 py-2 text-sm">
                  {kind === 'program' && (
                    <span className="w-11 shrink-0 font-semibold text-club tabular-nums">
                      {formatTime(match.date)}
                    </span>
                  )}
                  <Teams match={match} />
                  {kind === 'results' && (
                    <span className="shrink-0 font-semibold text-slate-900 tabular-nums">
                      {match.score ? `${match.score.home}-${match.score.away}` : '–'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pt-6 pb-10 lg:px-8">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Welkom</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Maak hier de afbeeldingen voor Instagram en Facebook van KV De Zwaluwen. Kies een
          onderdeel, vul aan wat nodig is en deel of download de story en post.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.filter((page) => page.id !== 'home').map((page) => (
          <a
            key={page.id}
            href={pagePath(page.id)}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-club"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{page.label}</span>
              {!page.ready && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  Binnenkort
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">{page.description}</p>
          </a>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeekList title="Programma deze week" kind="program" />
        <WeekList title="Uitslagen deze week" kind="results" />
      </div>
    </div>
  )
}
