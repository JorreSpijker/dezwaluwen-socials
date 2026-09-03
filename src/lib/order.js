import { formatDayKey } from './dates.js'

/**
 * Past een handmatige volgorde toe. Hoort de lijst id's niet meer bij de
 * huidige wedstrijden — na een ander bereik of een toevoeging — dan valt alles
 * terug op de chronologische volgorde.
 *
 * @param {object[]} matches
 * @param {string[]|null} order
 */
export function applyOrder(matches, order) {
  if (!order) return matches
  const index = new Map(order.map((id, i) => [id, i]))
  if (index.size !== matches.length || matches.some((m) => !index.has(m.id))) return matches
  return [...matches].sort((a, b) => index.get(a.id) - index.get(b.id))
}

/**
 * Verplaatst een wedstrijd naar de plek van een andere. Gaat het over twee
 * speeldagen, dan gebeurt er niets: de dagkoppen volgen de groepering, dus de
 * wedstrijd zou onder de verkeerde datum belanden.
 *
 * @returns {string[]|null} de nieuwe volgorde, of null als de zet niet mag
 */
export function moveWithinDay(ordered, activeId, overId) {
  const from = ordered.findIndex((m) => m.id === activeId)
  const to = ordered.findIndex((m) => m.id === overId)
  if (from === -1 || to === -1) return null
  if (formatDayKey(ordered[from].date) !== formatDayKey(ordered[to].date)) return null

  const ids = ordered.map((m) => m.id)
  const [moved] = ids.splice(from, 1)
  ids.splice(to, 0, moved)
  return ids
}
