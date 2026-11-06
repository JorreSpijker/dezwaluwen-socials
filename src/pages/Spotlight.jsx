import { useState } from 'react'
import { today } from '../lib/dates.js'
import { FIELD, PhotoField, TEXTAREA } from '../components/fields.jsx'
import Generator from '../components/Generator.jsx'
import SpotlightCanvas from '../components/SpotlightCanvas.jsx'

// Wat de Voorbeeld-tab toont.
const EXAMPLE = {
  photo: '/dummy_sponsor_photo.jpg',
  fit: 'cover',
  logo: '/dummy_sponsor_logo.svg',
  name: 'Intersport Luising',
  text: 'Voor sportkleding en schoenen ben je hier aan het juiste adres. Bedankt voor jullie steun aan onze club!',
}

export default function Spotlight() {
  const [photo, setPhoto] = useState(null)
  const [fit, setFit] = useState('cover')
  const [logo, setLogo] = useState(null)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('')

  return (
    <Generator
      fileName={`zwaluwen-sponsor-in-de-spotlight-${today()}`}
      canExport={Boolean(photo && name)}
      renderCanvas={(format, ref, isExample) => (
        <SpotlightCanvas
          ref={ref}
          format={format}
          photo={photo}
          fit={fit}
          logo={logo}
          name={name}
          text={text}
          website={website}
          {...(isExample && EXAMPLE)}
        />
      )}
      example="Zo kan een sponsor in de spotlight eruitzien: foto, logo, naam, tekst en website."
      settings={
        <>
          <PhotoField label="Foto" onChange={setPhoto} fit={fit} onFit={setFit} />
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
              rows={4}
              className={`mt-1 ${TEXTAREA}`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Website
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="www.voorbeeld.nl"
              className={`mt-1 ${FIELD}`}
            />
          </label>
        </>
      }
    />
  )
}
