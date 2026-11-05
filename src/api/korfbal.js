import { mockMatches } from './mock.js'

const BASE = 'https://api-saas-site-prod-236.dotlab.net/general/api/competition/clubs'

export const CLUB_ID = 'NCX35M2'

// matchDate en startTime zijn lokale wall-clock-waarden zonder offset; zo
// verschuift de tijdzone van de browser de getoonde tijd nooit.
function parseApiDate(date, time) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = (time ?? '00:00').split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

// Een nog niet gespeelde wedstrijd heeft score null bij beide teams.
function extractScore(home, away) {
  if (home.score == null || away.score == null) return null
  return { home: Number(home.score), away: Number(away.score) }
}

function normalize(match) {
  const home = match.homeTeam ?? {}
  const away = match.awayTeam ?? {}
  return {
    id: String(match.internalMatchId),
    date: parseApiDate(match.matchDate, match.startTime),
    home: home.teamName ?? '?',
    away: away.teamName ?? '?',
    isHomeClub: home.clubRefId === CLUB_ID,
    isAwayClub: away.clubRefId === CLUB_ID,
    facility: match.facility?.name ?? '',
    city: match.facility?.address?.city ?? '',
    field: match.field?.name ?? '',
    pool: match.pool?.name ?? '',
    score: extractScore(home, away),
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

  const params = new URLSearchParams({
    dt: 1,
    teamDetails: true,
    facility: true,
    dateFrom,
    dateTo,
    start: 0,
    length: 500,
  })
  const res = await fetch(`${BASE}/${CLUB_ID}/${kind}?${params}`)
  if (!res.ok) throw new Error(`KNKV-API gaf status ${res.status}`)
  const raw = (await res.json()).data ?? []
  const matches = raw
    .map(normalize)
    .sort((a, b) => a.date - b.date)
  return { matches, raw }
}
