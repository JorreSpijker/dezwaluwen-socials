import { useState } from 'react'
import { formatLongDate, today } from '../lib/dates.js'
import DateField, { FIELD, PhotoField, TEXTAREA } from '../components/fields.jsx'
import Generator from '../components/Generator.jsx'
import NewsCanvas from '../components/NewsCanvas.jsx'

// Wat de Voorbeeld-tab toont.
const EXAMPLE = {
  photo: '/dummy_nieuws.webp',
  fit: 'cover',
  title: 'Trainerscursus van start',
  text: 'Deze week begon de trainerscursus voor onze jeugdtrainers. Op het veld oefenden ze met warming-ups, spelvormen en het geven van aanwijzingen.',
  date: formatLongDate(today()),
}

export default function News() {
  const [photo, setPhoto] = useState(null)
  const [fit, setFit] = useState('cover')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [date, setDate] = useState(today)

  return (
    <Generator
      fileName={`zwaluwen-nieuws-${date}`}
      canExport={Boolean(photo && title)}
      renderCanvas={(format, ref, isExample) => (
        <NewsCanvas
          ref={ref}
          format={format}
          photo={photo}
          fit={fit}
          title={title}
          text={text}
          date={formatLongDate(date)}
          {...(isExample && EXAMPLE)}
        />
      )}
      example="Zo kan een nieuwsbericht eruitzien: foto, kop, tekst en datum."
      settings={
        <>
          <PhotoField label="Foto" onChange={setPhoto} fit={fit} onFit={setFit} />

          <label className="block text-sm font-medium text-slate-700">
            Kop
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          <DateField label="Datum" value={date} onChange={setDate} />
        </>
      }
    />
  )
}
