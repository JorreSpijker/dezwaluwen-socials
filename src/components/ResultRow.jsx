// Uitslag bekeken vanuit de eigen club. Speelt de club tegen zichzelf
// (bijv. een combinatieteam), dan is er geen winnaar om te kleuren.
function outcome(match) {
  const { score, isHomeClub, isAwayClub } = match
  if (!score) return 'bg-muted'
  if (score.home === score.away || (isHomeClub && isAwayClub)) return 'bg-draw'
  const clubScore = isHomeClub ? score.home : score.away
  const otherScore = isHomeClub ? score.away : score.home
  return clubScore > otherScore ? 'bg-win' : 'bg-loss'
}

export default function ResultRow({ match }) {
  const { score } = match

  return (
    <div className="flex items-center gap-[22px] rounded-2xl bg-surface px-[26px] py-[22px]">
      <div className="min-w-0 flex-1 text-[35px] leading-[1.15] text-muted">
        <span className={match.isHomeClub ? 'font-extrabold text-clubdeep' : 'font-medium'}>
          {match.home}
        </span>
        <span className="font-medium"> – </span>
        <span className={match.isAwayClub ? 'font-extrabold text-clubdeep' : 'font-medium'}>
          {match.away}
        </span>
      </div>
      <div
        className={`min-w-[158px] rounded-[10px] px-[22px] py-2.5 text-center text-[40px] font-extrabold tabular-nums text-white ${outcome(match)}`}
      >
        {score ? `${score.home}-${score.away}` : '–'}
      </div>
    </div>
  )
}
