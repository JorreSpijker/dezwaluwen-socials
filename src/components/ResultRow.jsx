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
    <div className="flex items-center gap-6 rounded-2xl bg-white px-[26px] py-5">
      <div className="min-w-0 flex-1 text-[34px] leading-[1.15] text-muted">
        <span className={match.isHomeClub ? 'font-extrabold text-clubdeep' : 'font-medium'}>
          {match.home}
        </span>
        <span className="font-medium"> – </span>
        <span className={match.isAwayClub ? 'font-extrabold text-clubdeep' : 'font-medium'}>
          {match.away}
        </span>
      </div>
      {/* Zelfde lettergrootte als de tijdkolom in het programma, zonder
          verticale padding: daarmee is een uitslagrij exact even hoog als een
          programmarij. */}
      <div
        className={`min-w-[158px] rounded-[10px] px-[22px] text-center text-[36px] font-extrabold tabular-nums text-white ${outcome(match)}`}
      >
        {score ? `${score.home}-${score.away}` : '–'}
      </div>
    </div>
  )
}
