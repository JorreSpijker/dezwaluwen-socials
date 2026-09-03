import { formatInputDate } from '../lib/dates.js'

// De weergave van <input type="date"> volgt de browsertaal en is niet in te
// stellen. Daarom tonen we de datum zelf in dd-mm-yyyy en leggen we de native
// input er transparant overheen, zodat de datumpicker op mobiel blijft werken.
function DateField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="relative mt-1">
        <div className="flex h-12 items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900">
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
          // Op desktop opent alleen het kalenderpictogram de picker, en dat is
          // hier onzichtbaar. Een klik op het veld opent hem alsnog.
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </div>
    </label>
  )
}

export default function Controls({
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  onThisWeek,
  teams,
  hiddenTeams,
  onToggleTeam,
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <DateField label="Van" value={dateFrom} onChange={onDateFrom} />
          <DateField label="Tot en met" value={dateTo} onChange={onDateTo} />
        </div>
        <button
          onClick={onThisWeek}
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-base font-medium text-slate-700"
        >
          Naar deze week
        </button>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700">Teams</h2>
        {teams.length === 0 ? (
          <p className="mt-1 text-sm text-slate-400">Geen teams gevonden.</p>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-x-4 lg:grid-cols-1 lg:gap-x-0">
            {teams.map((team) => (
              <label
                key={team}
                className="flex min-h-11 items-center gap-3 text-base text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={!hiddenTeams.has(team)}
                  onChange={() => onToggleTeam(team)}
                  className="size-5 shrink-0"
                />
                <span className="truncate">{team}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
