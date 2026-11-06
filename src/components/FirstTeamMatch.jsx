import { useEffect, useState } from 'react'
import { fetchMatches } from '../api/korfbal.js'
import { formatDayHeader, formatTime, seasonEnd, today } from '../lib/dates.js'
import { FIELD } from './fields.jsx'

// Het eerste seniorenteam. Aan de kant van de eigen club, zodat een
// tegenstander die toevallig ook op "Zwaluwen 1" eindigt niet meetelt.
const isFirstTeam = (match) =>
  (match.isHomeClub && /Zwaluwen 1$/.test(match.home)) ||
  (match.isAwayClub && /Zwaluwen 1$/.test(match.away))

/** De wedstrijden van Zwaluwen 1, van vandaag tot het eind van het seizoen. */
export function useFirstTeamMatches() {
  const [matches, setMatches] = useState([])
  // undefined = automatisch de eerstvolgende, '' = geen wedstrijd, anders een id.
  const [matchId, setMatchId] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMatches('program', today(), seasonEnd())
      .then((result) => !cancelled && setMatches(result.matches.filter(isFirstTeam)))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const selectedId = matchId === undefined ? matches[0]?.id : matchId
  const match = matches.find((m) => m.id === selectedId) ?? null

  return { matches, selectedId, setMatchId, match, loading, error }
}

export function FirstTeamMatchStatus({ matches, loading, error }) {
  return (
    <>
      {loading && <p className="text-sm text-slate-500">Laden…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="text-sm text-slate-500">Geen wedstrijden meer van Zwaluwen 1 dit seizoen.</p>
      )}
    </>
  )
}

export function FirstTeamMatchField({ matches, selectedId, setMatchId }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      Wedstrijd Zwaluwen 1
      <select
        value={selectedId ?? ''}
        onChange={(e) => setMatchId(e.target.value)}
        className={`mt-1 ${FIELD}`}
      >
        <option value="">Geen wedstrijd</option>
        {matches.map((m) => (
          <option key={m.id} value={m.id}>
            {formatDayHeader(m.date)} {formatTime(m.date)} · {m.home} – {m.away}
          </option>
        ))}
      </select>
    </label>
  )
}
