import { useEffect, useRef, useState } from 'react'
import { formatDayKey, formatTime } from '../lib/dates.js'
import DateField, { FIELD, TimeField } from './fields.jsx'

/**
 * Toevoegen en bewerken van een handmatige wedstrijd. Wie thuis speelt bepaalt
 * de volgorde in de rij, dus dat is een keuze en geen aanname.
 *
 * Het venster wordt alleen gemonteerd wanneer het open moet: de beginwaarden
 * staan daarmee meteen goed en er is geen flits van de vorige wedstrijd.
 *
 * Een native <dialog> staat in de top layer en wordt dus niet geknipt door de
 * overflow en sticky van de zijbalk. Esc, de focusval en de achtergrond komen
 * er gratis bij.
 */
function ScoreField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 ${FIELD}`}
      />
    </label>
  )
}

// De score van de eigen ploeg staat links in het formulier, ongeacht thuis of
// uit. Bij het opslaan draait de thuis/uit-keuze hem naar de kant waar hij in
// de rij hoort.
const ownSide = (match) => (match?.isHomeClub ? 'home' : 'away')

export default function MatchDialog({ kind, match, defaultDate, onSave, onClose }) {
  const results = kind === 'results'
  const dialogRef = useRef(null)
  const [team, setTeam] = useState(match ? (match.isHomeClub ? match.home : match.away) : '')
  const [opponent, setOpponent] = useState(
    match ? (match.isHomeClub ? match.away : match.home) : '',
  )
  const [date, setDate] = useState(match ? formatDayKey(match.date) : defaultDate)
  // Een uitslag kent geen tijd. Bij een nieuwe wedstrijd valt hij op middernacht
  // terug; bij het bewerken van een bestaande blijft de tijd staan die er al was.
  const [time, setTime] = useState(match ? formatTime(match.date) : results ? '00:00' : '')
  const [home, setHome] = useState(match ? match.isHomeClub : true)
  const [ownScore, setOwnScore] = useState(
    match?.score ? String(match.score[ownSide(match)]) : '',
  )
  const [oppScore, setOppScore] = useState(
    match?.score ? String(match.score[ownSide(match) === 'home' ? 'away' : 'home']) : '',
  )

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  const complete =
    team.trim() && opponent.trim() && date && (results ? ownScore !== '' && oppScore !== '' : time)

  // Geen preventDefault: het formulier staat op method="dialog", en dat sluit
  // het venster. preventDefault zou dat tegenhouden.
  function submit() {
    const score = results
      ? {
          home: Number(home ? ownScore : oppScore),
          away: Number(home ? oppScore : ownScore),
        }
      : (match?.score ?? null)

    onSave({
      id: match?.id,
      team: team.trim(),
      opponent: opponent.trim(),
      date,
      time,
      home,
      score,
    })
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto max-h-[calc(100vh-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto rounded-lg bg-white p-5 shadow-xl backdrop:bg-slate-900/40"
    >
      <h2 className="text-base font-semibold text-slate-900">
        {match ? 'Wedstrijd bewerken' : 'Wedstrijd toevoegen'}
      </h2>
      <form method="dialog" onSubmit={submit} className="mt-4 space-y-3">
        <input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="Eigen team"
          className={FIELD}
        />
        <input
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="Tegenstander"
          className={FIELD}
        />
        {results ? (
          <>
            <DateField label="Datum" value={date} onChange={setDate} />
            <div className="grid grid-cols-2 gap-3">
              <ScoreField label="Eigen team" value={ownScore} onChange={setOwnScore} />
              <ScoreField label="Tegenstander" value={oppScore} onChange={setOppScore} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <DateField label="Datum" value={date} onChange={setDate} />
            <TimeField label="Tijd" value={time} onChange={setTime} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Thuis', true],
            ['Uit', false],
          ].map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setHome(value)}
              className={`min-h-11 rounded-md border px-4 text-base font-medium ${
                home === value
                  ? 'border-[#0b2545] bg-[#0b2545] text-white'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-base font-medium text-slate-700"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={!complete}
            className="min-h-11 rounded-md bg-[#0b2545] px-4 text-base font-semibold text-white disabled:opacity-40"
          >
            {match ? 'Opslaan' : 'Toevoegen'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
