import { useLayoutEffect, useRef, useState } from 'react'
import { formatDayHeader } from '../lib/dates.js'
import { FORMATS } from '../lib/formats.js'
import CanvasFrame from './CanvasFrame.jsx'
import MatchRow from './MatchRow.jsx'
import ResultRow from './ResultRow.jsx'

export default function StoryCanvas({ ref, kind, groups, range, format = FORMATS.story, onMeasure }) {
  const Row = kind === 'results' ? ResultRow : MatchRow

  // De rijen staan op vaste grootte; past een dag niet in het frame, dan loopt
  // hij door naar een volgende story. Wat daarvoor nodig is — de vrije hoogte
  // en de hoogte van kop en rijen — meet deze canvas op verzoek terug.
  const listRef = useRef(null)
  const headerRef = useRef(null)
  const rowRefs = useRef(new Map())
  const [, remeasure] = useState(0)

  useLayoutEffect(() => {
    if (!onMeasure || !headerRef.current) return
    const rows = new Map()
    for (const [id, el] of rowRefs.current) rows.set(id, el.offsetHeight)
    onMeasure({ list: listRef.current.clientHeight, header: headerRef.current.offsetHeight, rows })
  })

  // Lettertype en logo laden ná de eerste meting: het eerste verandert de
  // hoogte van de rijen, het tweede die van de ruimte eromheen. Beide worden
  // geobserveerd zodat er daarna opnieuw wordt gemeten.
  // Zonder wedstrijden is er geen dagkop om te observeren. De sleutel van de
  // eerste dag zit in de deps omdat React die kop opnieuw aanmaakt zodra er een
  // andere dag bovenaan staat.
  useLayoutEffect(() => {
    if (!onMeasure || !headerRef.current) return
    const observer = new ResizeObserver(() => remeasure((n) => n + 1))
    observer.observe(listRef.current)
    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [onMeasure, groups[0]?.key])

  return (
    <CanvasFrame
      ref={ref}
      title={kind === 'results' ? 'UITSLAGEN' : 'PROGRAMMA'}
      subtitle={range}
      format={format}
    >
      <div ref={listRef} className="min-h-0 flex-1 overflow-hidden">
        {groups.length === 0 ? (
          <p className="pt-24 text-center text-[40px] text-muted">
            Geen wedstrijden in dit bereik
          </p>
        ) : (
          <div className="flex flex-col gap-[30px]">
            {groups.map((group, index) => (
              <div key={group.key} className="flex flex-col gap-3">
                <div
                  ref={index === 0 ? headerRef : undefined}
                  className="self-start rounded-md bg-clubtint px-5 py-[9px] text-2xl font-extrabold tracking-[0.14em] text-white uppercase"
                >
                  {formatDayHeader(group.date)}
                </div>
                {group.matches.map((match) => (
                  <div
                    key={match.id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(match.id, el)
                      else rowRefs.current.delete(match.id)
                    }}
                  >
                    <Row match={match} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </CanvasFrame>
  )
}
