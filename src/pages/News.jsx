import { useState } from 'react'
import { formatLongDate, today } from '../lib/dates.js'
import DateField, { FIELD, PhotoField, TEXTAREA } from '../components/fields.jsx'
import Generator from '../components/Generator.jsx'
import NewsCanvas from '../components/NewsCanvas.jsx'

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
      renderCanvas={(format, ref) => (
        <NewsCanvas
          ref={ref}
          format={format}
          photo={photo}
          fit={fit}
          title={title}
          text={text}
          date={formatLongDate(date)}
        />
      )}
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
