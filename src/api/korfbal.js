import { mockMatches } from './mock.js'

const BASE = 'https://api-mijn.korfbal.nl/api/v2/clubs'

export const CLUB_ID = 'NCX35M2'

// De API-datum draagt de juiste offset (+0200). We lezen de wall-clock-waarde
// rechtstreeks uit de string zodat de tijdzone van de browser de getoonde tijd
// nooit verschuift.
function parseApiDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value ?? '')
  if (!m) return new Date(value)
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
}

function toScore(value) {
  if (value == null) return null
  if (typeof value === 'string') {
    const m = /(\d+)\s*[-–:]\s*(\d+)/.exec(value)
    return m ? { home: +m[1], away: +m[2] } : null
  }
  if (typeof value === 'object') {
    const home = value.home ?? value.homeScore ?? value.home_score ?? value.goalsHome
    const away = value.away ?? value.awayScore ?? value.away_score ?? value.goalsAway
    if (Number.isFinite(Number(home)) && Number.isFinite(Number(away))) {
      return { home: Number(home), away: Number(away) }
    }
  }
  return null
}

// De API levert de uitslag als stats.home.score / stats.away.score; de overige
// plekken blijven als terugval staan.
function extractScore(match) {
  return (
    toScore({ home: match.stats?.home?.score, away: match.stats?.away?.score }) ??
    toScore(match.score) ??
    toScore(match.result) ??
    toScore({ home: match.teams?.home?.score, away: match.teams?.away?.score }) ??
    null
  )
}

function normalize(match, index) {
  const home = match.teams?.home ?? {}
  const away = match.teams?.away ?? {}
  return {
    id: `${match.ref_id ?? 'x'}-${index}`,
    date: parseApiDate(match.date),
    home: home.name ?? '?',
    away: away.name ?? '?',
    isHomeClub: home.clubRefId === CLUB_ID,
    isAwayClub: away.clubRefId === CLUB_ID,
    facility: match.facility?.name ?? '',
    city: match.facility?.address?.city ?? '',
    field: match.field?.name ?? match.clubAddition?.name ?? '',
    pool: match.pool?.name ?? '',
    score: extractScore(match),
  }
}

/**
 * @param {'program'|'results'} kind
 * @returns {Promise<{matches: object[], raw: object[]}>}
 */
export async function fetchMatches(kind, dateFrom, dateTo) {
  // Vite vervangt import.meta.env bij het bouwen door een letterlijke waarde,
  // waardoor de testcontent buiten debugmode uit de bundle valt.
  if (import.meta.env.VITE_DEBUG === 'true') return mockMatches(kind, dateFrom)

  const url = `${BASE}/${CLUB_ID}/${kind}?dateFrom=${dateFrom}&dateTo=${dateTo}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`KNKV-API gaf status ${res.status}`)
  const weeks = await res.json()
  const raw = (Array.isArray(weeks) ? weeks : []).flatMap((w) => w.matches ?? [])
  const matches = raw
    .map(normalize)
    .sort((a, b) => a.date - b.date)
  return { matches, raw }
}
