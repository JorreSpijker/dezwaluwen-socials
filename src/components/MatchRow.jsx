import { formatTime } from '../lib/dates.js'

export default function MatchRow({ match }) {
  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white px-[26px] py-5">
      <div className="min-w-[122px] text-[36px] font-extrabold tabular-nums text-club">
        {formatTime(match.date)}
      </div>
      <div className="w-0.5 shrink-0 self-stretch bg-rule"></div>
      <div className="min-w-0 flex-1 text-[34px] leading-[1.15] text-muted">
        <span className={match.isHomeClub ? 'font-extrabold text-clubdeep' : 'font-medium'}>
          {match.home}
        </span>
        <span className="font-medium"> – </span>
        <span className={match.isAwayClub ? 'font-extrabold text-clubdeep' : 'font-medium'}>
          {match.away}
        </span>
      </div>
    </div>
  )
}
