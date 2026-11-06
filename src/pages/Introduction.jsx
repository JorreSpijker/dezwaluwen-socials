import { useState } from 'react'
import { X } from 'lucide-react'
import { today } from '../lib/dates.js'
import { FIELD, PhotoField } from '../components/fields.jsx'
import Generator from '../components/Generator.jsx'
import IntroductionCanvas from '../components/IntroductionCanvas.jsx'

const DEFAULT_QUESTIONS = [
  'Hoe lang korfbal je al?',
  'Wat is je mooiste korfbalmoment?',
  'Wat doe je naast korfbal?',
].map((question) => ({ question, answer: '' }))

// Wat de Voorbeeld-tab toont.
const EXAMPLE = {
  photo: '/dummy_voorstellen.webp',
  fit: 'cover',
  name: 'Sanne de Vries',
  team: 'Speler Zwaluwen F1',
  questions: [
    { question: 'Hoe lang korfbal je al?', answer: 'Dit is mijn tweede seizoen.' },
    { question: 'Wat is je mooiste korfbalmoment?', answer: 'Mijn eerste doelpunt in een wedstrijd.' },
    { question: 'Wat doe je naast korfbal?', answer: 'Tekenen en buitenspelen met mijn vriendinnen.' },
  ],
}

export default function Introduction() {
  const [photo, setPhoto] = useState(null)
  const [fit, setFit] = useState('cover')
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS)

  const updateQuestion = (index, field, value) =>
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, [field]: value } : q)))

  return (
    <Generator
      fileName={`zwaluwen-voorstelrondje-${today()}`}
      canExport={Boolean(photo && name)}
      renderCanvas={(format, ref, isExample) => (
        <IntroductionCanvas
          ref={ref}
          format={format}
          photo={photo}
          fit={fit}
          name={name}
          team={team}
          questions={questions}
          {...(isExample && EXAMPLE)}
        />
      )}
      example="Zo kan een voorstelrondje eruitzien: foto, naam, rol en beantwoorde vragen."
      settings={
        <>
          <PhotoField label="Foto" onChange={setPhoto} fit={fit} onFit={setFit} />

          <label className="block text-sm font-medium text-slate-700">
            Naam
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 ${FIELD}`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Team of rol
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Speler Zwaluwen 2"
              className={`mt-1 ${FIELD}`}
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700">Vragen</legend>
            {questions.map((q, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex gap-2">
                  <input
                    value={q.question}
                    onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                    placeholder="Vraag"
                    aria-label={`Vraag ${i + 1}`}
                    className={FIELD}
                  />
                  <button
                    onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}
                    aria-label={`Vraag ${i + 1} verwijderen`}
                    className="flex size-12 shrink-0 items-center justify-center rounded-md text-slate-500 hover:text-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <input
                  value={q.answer}
                  onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
                  placeholder="Antwoord"
                  aria-label={`Antwoord ${i + 1}`}
                  className={FIELD}
                />
              </div>
            ))}
            <button
              onClick={() => setQuestions((qs) => [...qs, { question: '', answer: '' }])}
              className="w-full rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-club"
            >
              Vraag toevoegen
            </button>
          </fieldset>
        </>
      }
    />
  )
}
