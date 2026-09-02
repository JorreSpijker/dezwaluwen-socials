import { useLayoutEffect, useRef, useState } from 'react'
import { formatDayHeader, formatDayKey, formatRange } from '../lib/dates.js'
import MatchRow from './MatchRow.jsx'
import ResultRow from './ResultRow.jsx'

function groupByDay(matches) {
  const groups = []
  for (const match of matches) {
    const key = formatDayKey(match.date)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.matches.push(match)
    else groups.push({ key, date: match.date, matches: [match] })
  }
  return groups
}

export default function StoryCanvas({ ref, kind, matches, dateFrom, dateTo }) {
  const groups = groupByDay(matches)
  const Row = kind === 'results' ? ResultRow : MatchRow

  // De lijst wordt als geheel teruggeschaald wanneer hij niet in het frame past,
  // zodat de story altijd één afbeelding blijft. De breedte wordt mee opgerekt
  // zodat de rijen na het schalen weer de volle kolombreedte vullen.
  const listRef = useRef(null)
  const innerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [, remeasure] = useState(0)
  useLayoutEffect(() => {
    const natural = innerRef.current?.scrollHeight
    const next = natural ? Math.min(1, listRef.current.clientHeight / natural) : 1
    if (Math.abs(next - scale) > 0.004) setScale(next)
  })

  // Lettertype en logo laden ná de eerste meting: het eerste verandert de
  // hoogte van de lijst, het tweede die van de ruimte eromheen. Beide worden
  // geobserveerd zodat de schaal daarna opnieuw wordt uitgerekend.
  useLayoutEffect(() => {
    if (!innerRef.current) return
    const observer = new ResizeObserver(() => remeasure((n) => n + 1))
    observer.observe(innerRef.current)
    observer.observe(listRef.current)
    return () => observer.disconnect()
  }, [matches, kind])

  const range = matches.length
    ? formatRange(matches[0].date, matches[matches.length - 1].date)
    : formatRange(dateFrom, dateTo)

  return (
    <div
      ref={ref}
      className="relative flex h-[1920px] w-[1080px] shrink-0 flex-col overflow-hidden bg-white font-archivo"
    >
      {/* Clubfoto als achtergrond: sterk vervaagd en onder een witte gradient,
          zodat er kleur doorschemert zonder de leesbaarheid te raken. */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/bg.jpg"
          alt=""
          className="size-full scale-110 object-cover blur-[10px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/62 via-white/56 to-white"></div>
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
          {matches.length === 0 ? (
            <p className="pt-24 text-center text-[40px] text-muted">
              Geen wedstrijden in dit bereik
            </p>
          ) : (
            <div
              ref={innerRef}
              className="flex flex-col gap-[30px]"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${100 / scale}%`,
              }}
            >
              {groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-3">
                  <div className="self-start rounded-md bg-clubtint px-5 py-[9px] text-2xl font-extrabold tracking-[0.14em] text-white uppercase">
                    {formatDayHeader(group.date)}
                  </div>
                  {group.matches.map((match) => (
                    <Row key={match.id} match={match} />
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
