export default function Controls({
  dateFrom,
  dateTo,
  onDateFrom,
  onDateTo,
  teams,
  hiddenTeams,
  onToggleTeam,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-slate-700">
          Van
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFrom(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Tot en met
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateTo(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base"
          />
        </label>
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
