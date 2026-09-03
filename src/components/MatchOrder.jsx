import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDayHeader, formatTime } from '../lib/dates.js'

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" />
    </svg>
  )
}

function SortableMatch({ match, shown, onToggle, onEdit, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: match.id,
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-md bg-white pl-2 text-sm text-slate-700 ${
        isDragging ? 'relative z-10 shadow-md' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={shown}
        onChange={onToggle}
        aria-label={`Toon ${match.home} – ${match.away}`}
        className="size-5 shrink-0"
      />
      <div className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 ${shown ? '' : 'opacity-40'}`}>
        <span className="w-12 shrink-0 tabular-nums">{formatTime(match.date)}</span>
        <span className="min-w-0 flex-1 truncate">
          {match.home} – {match.away}
        </span>
      </div>
      {/* Alleen handmatig toegevoegde wedstrijden zijn te bewerken; die uit de
          KNKV-respons komen bij de volgende ophaalronde toch weer terug. */}
      {match.custom && (
        <>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Bewerk ${match.home} – ${match.away}`}
            className="flex size-8 shrink-0 items-center justify-center text-slate-400"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Verwijder ${match.home} – ${match.away}`}
            className="size-8 shrink-0 text-lg text-slate-400"
          >
            ×
          </button>
        </>
      )}
      {/* De listeners zitten op de greep en niet op de rij: daarmee blijft de
          zijbalk op een telefoon gewoon scrollbaar. touch-none is nodig omdat
          de browser de aanraking anders zelf als scroll opeist. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Verplaats ${match.home} – ${match.away}`}
        className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center text-slate-400"
      >
        <GripIcon />
      </button>
    </li>
  )
}

/**
 * Volgorde en zichtbaarheid in één lijst. Elke speeldag is een eigen
 * sorteerlijst, zodat een wedstrijd niet onder de dagkop van een andere datum
 * kan belanden. Verborgen wedstrijden blijven in de lijst staan, anders zijn ze
 * niet meer terug te zetten.
 */
export default function MatchOrder({
  groups,
  hidden,
  onToggle,
  onEdit,
  onRemove,
  onReorder,
  onReset,
  reordered,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function dragEnd({ active, over }) {
    if (over && active.id !== over.id) onReorder(active.id, over.id)
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-slate-700">Wedstrijden</h2>
        {reordered && (
          <button onClick={onReset} className="text-sm text-slate-500 underline">
            Herstel
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="mt-1 text-sm text-slate-400">Geen wedstrijden in dit bereik.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={dragEnd}
        >
          <div className="mt-2 space-y-3">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  {formatDayHeader(group.date)}
                </p>
                <SortableContext
                  items={group.matches.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="mt-1">
                    {group.matches.map((match) => (
                      <SortableMatch
                        key={match.id}
                        match={match}
                        shown={!hidden.has(match.id)}
                        onToggle={() => onToggle(match.id)}
                        onEdit={() => onEdit(match)}
                        onRemove={() => onRemove(match.id)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}
    </div>
  )
}
