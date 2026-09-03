const KEY = 'dezwaluwen-socials.state'

const EMPTY = () => ({ matches: [], order: null, hidden: new Set() })

const isIdList = (value) => Array.isArray(value) && value.every((id) => typeof id === 'string')

/**
 * De eigen wedstrijden, de handmatige volgorde en de verborgen wedstrijden
 * overleven een herlaad. De datum gaat als ISO-string de opslag in en komt er
 * als Date weer uit; dat is hetzelfde tijdstip, dus de wandkloktijd blijft
 * staan.
 *
 * Wat er in de opslag staat is niet te vertrouwen — het kan van een oudere
 * versie zijn of met de hand aangepast. Onbruikbare onderdelen vallen terug op
 * leeg in plaats van de app te laten struikelen.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY()
    const { matches, order, hidden } = JSON.parse(raw)
    return {
      matches: Array.isArray(matches)
        ? matches
            .map((match) => ({ ...match, date: new Date(match.date) }))
            .filter((match) => match.id && !Number.isNaN(match.date.getTime()))
        : [],
      order: isIdList(order) ? order : null,
      hidden: new Set(isIdList(hidden) ? hidden : []),
    }
  } catch {
    return EMPTY()
  }
}

export function saveState({ matches, order, hidden }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ matches, order, hidden: [...hidden] }))
  } catch {
    // Opslag kan uitstaan of vol zijn. Alles blijft gewoon in deze sessie
    // bestaan; er valt hier verder niets zinnigs te doen.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Zie saveState.
  }
}
