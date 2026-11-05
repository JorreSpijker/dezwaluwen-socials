import { useEffect, useState } from 'react'
import { fetchMatches } from '../api/korfbal.js'
import { formatDayHeader, formatTime, seasonEnd, today } from '../lib/dates.js'
import { FIELD, PhotoField, TEXTAREA } from '../components/fields.jsx'
import Generator from '../components/Generator.jsx'
import TeamCanvas from '../components/TeamCanvas.jsx'

// Het eerste seniorenteam. Aan de kant van de eigen club, zodat een
// tegenstander die toevallig ook op "Zwaluwen 1" eindigt niet meetelt.
const isFirstTeam = (match) =>
  (match.isHomeClub && /Zwaluwen 1$/.test(match.home)) ||
  (match.isAwayClub && /Zwaluwen 1$/.test(match.away))

export default function TeamOfWeek() {
  // Alleen S1, van vandaag tot het eind van het seizoen.
  const [matches, setMatches] = useState([])
  // undefined = automatisch de eerstvolgende, '' = geen wedstrijd, anders een id.
  const [matchId, setMatchId] = useState()
  const [photo, setPhoto] = useState(null)
  const [fit, setFit] = useState('cover')
  const [team, setTeam] = useState('')
  const [text, setText] = useState('')
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

  return (
    <Generator
      fileName={`zwaluwen-team-van-de-week-${today()}`}
      canExport={Boolean(photo)}
      renderCanvas={(format, ref) => (
        <TeamCanvas
          ref={ref}
          format={format}
          photo={photo}
          fit={fit}
          team={team}
          text={text}
          match={match}
        />
      )}
      status={
        <>
          {loading && <p className="text-sm text-slate-500">Laden…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && matches.length === 0 && (
            <p className="text-sm text-slate-500">Geen wedstrijden meer van Zwaluwen 1 dit seizoen.</p>
          )}
        </>
      }
      settings={
        <>
          <PhotoField label="Teamfoto" onChange={setPhoto} fit={fit} onFit={setFit} />

          <label className="block text-sm font-medium text-slate-700">
            Teamnaam
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Zwaluwen J7"
              className={`mt-1 ${FIELD}`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Tekst
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className={`mt-1 ${TEXTAREA}`}
            />
          </label>

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
        </>
      }
    />
  )
}
