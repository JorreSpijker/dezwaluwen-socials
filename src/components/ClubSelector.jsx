import { CLUBS, CUSTOM_ID } from '../config/club.js'

export default function ClubSelector({ clubId, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      Club
      <select
        value={clubId}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900"
      >
        {CLUBS.map((club) => (
          <option key={club.id} value={club.id}>
            {club.name}
          </option>
        ))}
        <option value={CUSTOM_ID}>Overig</option>
      </select>
    </label>
  )
}
