const BASE = 'https://api-mijn.korfbal.nl/api/v2/clubs'

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
    if (home != null && away != null) return { home: Number(home), away: Number(away) }
  }
  return null
}

// De vorm van een uitslag-object is niet empirisch te verifiëren zolang de API
// geen gespeelde wedstrijden teruggeeft; daarom meerdere plekken proberen.
function extractScore(match) {
  return (
    toScore(match.score) ??
    toScore(match.result) ??
    toScore(match.stats) ??
    toScore({ home: match.teams?.home?.score, away: match.teams?.away?.score }) ??
    null
  )
}

function normalize(match, index, clubCode) {
  const home = match.teams?.home ?? {}
  const away = match.teams?.away ?? {}
  return {
    id: `${match.ref_id ?? 'x'}-${index}`,
    date: parseApiDate(match.date),
    home: home.name ?? '?',
    away: away.name ?? '?',
    isHomeClub: home.clubRefId === clubCode,
    isAwayClub: away.clubRefId === clubCode,
    facility: match.facility?.name ?? '',
    city: match.facility?.address?.city ?? '',
    field: match.field?.name ?? match.clubAddition?.name ?? '',
    pool: match.pool?.name ?? '',
    score: extractScore(match),
  }
}

/**
 * @param {'program'|'results'} kind
 * @param {string} clubCode KNKV-clubcode, bijv. NCX35M2
 * @returns {Promise<{matches: object[], raw: object[]}>}
 */
export async function fetchMatches(kind, dateFrom, dateTo, clubCode) {
  const url = `${BASE}/${clubCode}/${kind}?dateFrom=${dateFrom}&dateTo=${dateTo}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`KNKV-API gaf status ${res.status}`)
  const weeks = await res.json()
  const raw = (Array.isArray(weeks) ? weeks : []).flatMap((w) => w.matches ?? [])
  const matches = raw
    .map((match, index) => normalize(match, index, clubCode))
    .sort((a, b) => a.date - b.date)
  return { matches, raw }
}

/** Alle eigen teams die in de respons voorkomen, gesorteerd. */
export function ownTeams(matches) {
  const names = new Set()
  for (const m of matches) {
    if (m.isHomeClub) names.add(m.home)
    if (m.isAwayClub) names.add(m.away)
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'nl', { numeric: true }))
}
