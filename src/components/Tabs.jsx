const TABS = [
  { id: 'program', label: 'Programma' },
  { id: 'results', label: 'Uitslagen' },
]

export default function Tabs({ tab, onChange }) {
  return (
    <div className="flex gap-2 rounded-lg bg-slate-200 p-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === t.id ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
