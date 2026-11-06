import { useState } from 'react'
import { today } from '../lib/dates.js'
import { FIELD, PhotoField, TEXTAREA } from '../components/fields.jsx'
import {
  FirstTeamMatchField,
  FirstTeamMatchStatus,
  useFirstTeamMatches,
} from '../components/FirstTeamMatch.jsx'
import Generator from '../components/Generator.jsx'
import TeamCanvas from '../components/TeamCanvas.jsx'

// Wat de Voorbeeld-tab toont; de wedstrijd blijft de gekozen wedstrijd.
const EXAMPLE = {
  photo: '/dummy_teamvandeweek.jpg',
  fit: 'cover',
  team: 'Zwaluwen J7',
  text: 'Deze week in het zonnetje: de J7! Ze wonnen zaterdag hun derde wedstrijd op rij.',
}

export default function TeamOfWeek() {
  const firstTeam = useFirstTeamMatches()
  const [photo, setPhoto] = useState(null)
  const [fit, setFit] = useState('cover')
  const [team, setTeam] = useState('')
  const [text, setText] = useState('')

  return (
    <Generator
      fileName={`zwaluwen-team-van-de-week-${today()}`}
      canExport={Boolean(photo)}
      renderCanvas={(format, ref, isExample) => (
        <TeamCanvas
          ref={ref}
          format={format}
          photo={photo}
          fit={fit}
          team={team}
          text={text}
          match={firstTeam.match}
          {...(isExample && EXAMPLE)}
        />
      )}
      example="Zo kan team van de week eruitzien: teamfoto, teamnaam, tekst en de wedstrijd van Zwaluwen 1."
      status={<FirstTeamMatchStatus {...firstTeam} />}
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

          <FirstTeamMatchField {...firstTeam} />
        </>
      }
    />
  )
}
