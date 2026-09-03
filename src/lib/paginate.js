import { formatDayKey } from './dates.js'

// Verticale ruimte die StoryCanvas zelf aanbrengt: tussen twee dagblokken
// (gap-[30px]) en binnen een dagblok tussen kop en rijen (gap-3).
const GAP_BLOCK = 30
const GAP_ROW = 12

export function groupByDay(matches) {
  const groups = []
  for (const match of matches) {
    const key = formatDayKey(match.date)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.matches.push(match)
    else groups.push({ key, date: match.date, matches: [match] })
  }
  return groups
}

/**
 * Verdeelt de wedstrijden over zoveel stories als nodig, op ware grootte. Een
 * dag die niet in één afbeelding past loopt door naar de volgende, met de
 * dagkop daar herhaald.
 *
 * @param {object[]} matches
 * @param {{list: number, header: number, rows: Map<string, number>}|null} metrics
 *   Gemeten hoogtes uit StoryCanvas. Zolang die er niet zijn valt alles op één
 *   pagina; de meting corrigeert dat in de render erna.
 * @returns {object[][]} pagina's, elk een lijst dagblokken
 */
export function paginate(matches, metrics) {
  const groups = groupByDay(matches)
  if (!metrics || !metrics.list) return groups.length ? [groups] : [[]]

  const pages = []
  let page = []
  let block = null
  let used = 0
  let rowsOnPage = 0

  for (const group of groups) {
    block = null
    for (const match of group.matches) {
      const rowHeight = metrics.rows.get(match.id) ?? 0
      // Een rij die een dagblok opent neemt de kop en de ruimte ervoor mee.
      const opening = (page.length ? GAP_BLOCK : 0) + metrics.header
      const needed = (block ? 0 : opening) + GAP_ROW + rowHeight

      // Past de rij niet meer, dan begint een nieuwe pagina met dezelfde dagkop.
      // De controle op rowsOnPage voorkomt een lege pagina wanneer zelfs één
      // rij te hoog is; die loopt dan bewust over.
      if (used + needed > metrics.list && rowsOnPage > 0) {
        pages.push(page)
        page = []
        used = 0
        rowsOnPage = 0
        block = null
      }

      // Pas openen als vaststaat dat de rij erin komt, anders blijft er een
      // dagkop zonder wedstrijden achter.
      if (!block) {
        used += (page.length ? GAP_BLOCK : 0) + metrics.header
        block = { key: group.key, date: group.date, matches: [] }
        page.push(block)
      }

      block.matches.push(match)
      used += GAP_ROW + rowHeight
      rowsOnPage += 1
    }
  }

  pages.push(page)
  return pages
}
