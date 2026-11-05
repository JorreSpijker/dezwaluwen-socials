export default function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 lg:px-8">
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">Binnenkort</p>
      </div>
    </div>
  )
}
