import { formatTime } from '../lib/dates.js'

export default function ResultRow({ match, rowH, fs }) {
  const { score } = match
  const homeWon = score && score.home > score.away
  const awayWon = score && score.away > score.home

  const teamClass = (isClub, won) =>
    [isClub ? 'font-bold' : 'font-normal', won ? 'text-white' : 'text-white/70'].join(' ')

  return (
    <div
      className="flex items-center border-b border-white/10"
      style={{ height: rowH, gap: rowH * 0.28 }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate" style={{ fontSize: fs.team, lineHeight: 1.15 }}>
          <span className={teamClass(match.isHomeClub, homeWon)}>{match.home}</span>
          <span className="px-2 text-white/40">–</span>
          <span className={teamClass(match.isAwayClub, awayWon)}>{match.away}</span>
        </div>
        {fs.showMeta && (
          <div className="truncate text-white/45" style={{ fontSize: fs.meta, lineHeight: 1.2 }}>
            {[formatTime(match.date), match.facility, match.city].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>

      <div
        className="shrink-0 text-right font-bold text-[#f2c14e] tabular-nums"
        style={{ fontSize: fs.team, width: fs.team * 4 }}
      >
        {score ? `${score.home} - ${score.away}` : '–'}
      </div>
    </div>
  )
}
