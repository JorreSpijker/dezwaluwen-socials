import { useState } from 'react'
import { today } from '../lib/dates.js'
import { FIELD, PhotoField, TEXTAREA } from '../components/fields.jsx'
import {
  FirstTeamMatchField,
  FirstTeamMatchStatus,
  useFirstTeamMatches,
} from '../components/FirstTeamMatch.jsx'
import BallSponsorCanvas from '../components/BallSponsorCanvas.jsx'
import Generator from '../components/Generator.jsx'

// Wat de Voorbeeld-tab toont; de wedstrijd blijft de gekozen wedstrijd.
const EXAMPLE = {
  logo: '/dummy_sponsor_logo.svg',
  name: 'Intersport Luising',
  text: 'Bedankt voor jullie steun aan Zwaluwen 1!',
}

export default function BallSponsor() {
  const firstTeam = useFirstTeamMatches()
  const [logo, setLogo] = useState(null)
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  return (
    <Generator
      fileName={`zwaluwen-balsponsor-${today()}`}
      canExport={Boolean(logo && name)}
      renderCanvas={(format, ref, isExample) => (
        <BallSponsorCanvas
          ref={ref}
          format={format}
          logo={logo}
          name={name}
          text={text}
          match={firstTeam.match}
          {...(isExample && EXAMPLE)}
        />
      )}
      example="Zo kan een balsponsor-post eruitzien: logo, naam, tekst en de wedstrijd van Zwaluwen 1."
      status={<FirstTeamMatchStatus {...firstTeam} />}
      settings={
        <>
          <PhotoField label="Logo" onChange={setLogo} />

          <label className="block text-sm font-medium text-slate-700">
            Sponsornaam
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 ${FIELD}`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Tekst
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className={`mt-1 ${TEXTAREA}`}
            />
          </label>

          <FirstTeamMatchField {...firstTeam} />
        </>
      }
    />
  )
}
