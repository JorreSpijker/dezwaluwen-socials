import { formatDayHeader, formatDayKey, formatRange } from '../lib/dates.js'
import MatchRow from './MatchRow.jsx'
import ResultRow from './ResultRow.jsx'

const PAD = 64
const HEADER_H = 510
const FOOTER_H = 120
const LIST_H = 1920 - HEADER_H - FOOTER_H

const clamp = (min, value, max) => Math.max(min, Math.min(max, value))

function groupByDay(matches) {
  const groups = []
  for (const match of matches) {
    const key = formatDayKey(match.date)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.matches.push(match)
    else groups.push({ key, date: match.date, matches: [match] })
  }
  return groups
}

// Eén afgeleide maat uit het aantal rijen bepaalt rijhoogte, fontsizes en
// dagkoppen. Deterministisch, dus preview en export zijn identiek.
function scaleFor(matchCount, dayCount) {
  const units = matchCount + dayCount * 0.9
  const rowH = clamp(22, LIST_H / Math.max(units, 1), 132)
  const dayH = rowH * 0.9
  const team = clamp(14, rowH * 0.36, 44)
  return {
    rowH,
    dayH,
    fs: {
      team,
      time: team * 0.95,
      meta: team * 0.6,
      day: clamp(12, dayH * 0.6, 38),
      showMeta: rowH >= 78,
    },
  }
}

export default function StoryCanvas({ ref, kind, matches, dateFrom, dateTo }) {
  const groups = groupByDay(matches)
  const { rowH, dayH, fs } = scaleFor(matches.length, groups.length)
  const Row = kind === 'results' ? ResultRow : MatchRow

  return (
    <div
      ref={ref}
      className="flex flex-col overflow-hidden bg-[#0b2545] text-white"
      style={{ width: 1080, height: 1920, padding: PAD }}
    >
      <header className="shrink-0" style={{ height: HEADER_H - PAD }}>
        <img
          src="/logo-placeholder.svg"
          alt=""
          className="mx-auto"
          style={{ width: 200, height: 200 }}
        />
        <h1 className="mt-8 text-center font-extrabold tracking-tight" style={{ fontSize: 92 }}>
          {kind === 'results' ? 'UITSLAGEN' : 'PROGRAMMA'}
        </h1>
        <p className="mt-2 text-center text-[#f2c14e]" style={{ fontSize: 34 }}>
          {formatRange(dateFrom, dateTo)}
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden" style={{ height: LIST_H }}>
        {matches.length === 0 ? (
          <p className="pt-24 text-center text-white/50" style={{ fontSize: 40 }}>
            Geen wedstrijden in dit bereik
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.key}>
              <div
                className="flex items-end font-bold text-[#f2c14e] uppercase"
                style={{ height: dayH, fontSize: fs.day, paddingBottom: dayH * 0.15 }}
              >
                {formatDayHeader(group.date)}
              </div>
              {group.matches.map((match) => (
                <Row key={match.id} match={match} rowH={rowH} fs={fs} />
              ))}
            </div>
          ))
        )}
      </main>

      <footer
        className="flex shrink-0 items-center justify-between text-white/60"
        style={{ height: FOOTER_H - PAD, fontSize: 30 }}
      >
        <span className="font-bold text-white">KV De Zwaluwen</span>
        <span>@dezwaluwen</span>
      </footer>
    </div>
  )
}
