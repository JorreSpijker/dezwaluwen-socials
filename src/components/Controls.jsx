import DateField from './fields.jsx'

export default function Controls({ dateFrom, dateTo, onDateFrom, onDateTo, onThisWeek }) {
  return (
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
  )
}
