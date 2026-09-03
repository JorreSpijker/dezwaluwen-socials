import { useLayoutEffect, useRef, useState } from 'react'
import { formatDayHeader } from '../lib/dates.js'
import MatchRow from './MatchRow.jsx'
import ResultRow from './ResultRow.jsx'

export default function StoryCanvas({ ref, kind, groups, range, onMeasure }) {
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
    <div
      ref={ref}
      className="relative flex h-[1920px] w-[1080px] shrink-0 flex-col overflow-hidden bg-white font-archivo"
    >
      {/* Clubfoto als achtergrond: onder een witte gradient, zodat er kleur
          doorschemert zonder de leesbaarheid te raken. De blur zit in het
          bestand zelf: Safari laat een CSS-filter vallen bij het exporteren.
          Om dezelfde reden staan hier vaste pixelmaten in plaats van inset-0
          en size-full — percentages klappen daar dicht naar 0. */}
      <div className="absolute top-0 left-0 h-[1920px] w-[1080px] overflow-hidden">
        <img src="/bg-blur.jpg" alt="" width="1080" height="1920" />
        <div className="absolute top-0 left-0 h-[1920px] w-[1080px] bg-gradient-to-b from-white/62 via-white/56 to-white"></div>
      </div>

      <div className="relative h-[18px] shrink-0 bg-club"></div>
      <div className="relative flex min-h-0 flex-1 flex-col px-16 pt-[36px] pb-14">
        <div className="flex items-center gap-[34px]">
          <img
            src="/logo.svg"
            alt="KV De Zwaluwen"
            className="h-auto w-[260px] shrink-0"
          />
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="text-[96px] leading-[0.9] font-black tracking-[-0.075em] text-club">
              {kind === 'results' ? 'UITSLAGEN' : 'PROGRAMMA'}
            </div>
            <div className="font-barlow text-[30px] font-semibold tracking-[0.06em] text-muted">
              {range}
            </div>
          </div>
        </div>
        <div className="mt-[38px] mb-[34px] h-[3px] shrink-0 bg-club"></div>

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

        <div className="mt-[34px] flex shrink-0 items-center justify-between border-t-2 border-rule pt-7">
          <div className="text-[27px] font-bold text-clubdeep">KV de Zwaluwen</div>
          <div className="font-barlow text-[27px] font-semibold tracking-[0.04em] text-club">
            @kvdezwaluwen
          </div>
        </div>
      </div>
    </div>
  )
}
