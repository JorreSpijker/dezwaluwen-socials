import { formatInputDate } from '../lib/dates.js'

export const FIELD =
  'h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900'

const BOX =
  'flex h-12 items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900'
const OVERLAY = 'absolute inset-0 size-full cursor-pointer opacity-0'

// Op desktop opent alleen het pictogram van de native input de picker, en dat
// is hier onzichtbaar. Een klik op het veld opent hem alsnog.
const openPicker = (e) => e.currentTarget.showPicker?.()

// De weergave van <input type="date"> en <input type="time"> volgt de
// browsertaal en is niet in te stellen — een Engelse browser toont mm/dd/yyyy
// en 2:30 PM. Daarom tonen we de waarde zelf en leggen we de native input er
// transparant overheen, zodat de picker op mobiel blijft werken.
export default function DateField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="relative mt-1">
        <div className={BOX}>
          <span>{formatInputDate(value) || 'dd-mm-jjjj'}</span>
          <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-slate-400" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"
            />
          </svg>
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          className={OVERLAY}
        />
      </div>
    </label>
  )
}

// De waarde van een time-input is altijd HH:mm, ongeacht wat de browser toont.
// Die tonen we rechtstreeks, en daarmee staat de tijd overal in 24-uursnotatie.
export function TimeField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="relative mt-1">
        <div className={BOX}>
          <span className="tabular-nums">{value || 'uu:mm'}</span>
          <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-slate-400" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
            />
          </svg>
        </div>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          className={OVERLAY}
        />
      </div>
    </label>
  )
}
