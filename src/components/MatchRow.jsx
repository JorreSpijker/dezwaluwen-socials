import { formatTime } from '../lib/dates.js'

export default function MatchRow({ match, rowH, fs }) {
  return (
    <div
      className="flex items-center border-b border-white/10"
      style={{ height: rowH, gap: rowH * 0.28 }}
    >
      <div
        className="shrink-0 font-bold text-[#f2c14e] tabular-nums"
        style={{ fontSize: fs.time, width: fs.time * 3.4 }}
      >
        {formatTime(match.date)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-white" style={{ fontSize: fs.team, lineHeight: 1.15 }}>
          <span className={match.isHomeClub ? 'font-bold' : 'font-normal text-white/80'}>
            {match.home}
          </span>
          <span className="px-2 text-white/40">–</span>
          <span className={match.isAwayClub ? 'font-bold' : 'font-normal text-white/80'}>
            {match.away}
          </span>
        </div>
        {fs.showMeta && (
          <div className="truncate text-white/45" style={{ fontSize: fs.meta, lineHeight: 1.2 }}>
            {[match.facility, match.city, match.field].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  )
}
