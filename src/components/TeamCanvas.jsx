import { formatDayHeader } from '../lib/dates.js'
import { FORMATS } from '../lib/formats.js'
import CanvasFrame from './CanvasFrame.jsx'
import PhotoBox from './PhotoBox.jsx'
import MatchRow from './MatchRow.jsx'

export default function TeamCanvas({ ref, photo, team, text, match, fit = 'cover', format = FORMATS.story }) {
  const compact = format.key === 'post'

  return (
    <CanvasFrame
      ref={ref}
      title={
        <>
          TEAM VAN
          <br />
          DE WEEK
        </>
      }
      format={format}
    >
      <div className={`flex min-h-0 flex-1 flex-col ${compact ? 'gap-[22px]' : 'gap-[34px]'}`}>
        <PhotoBox photo={photo} fit={fit} empty="Nog geen teamfoto" gap={compact ? 22 : 34}>
          {team && (
            <h2
              className={`leading-[1.05] font-black tracking-[-0.03em] text-clubdeep ${
                compact ? 'text-[48px]' : 'text-[64px]'
              }`}
            >
              {team}
            </h2>
          )}

          {text && (
            <p
              className={`font-medium whitespace-pre-line text-clubdeep ${
                compact ? 'text-[28px] leading-[1.3]' : 'text-[34px] leading-[1.35]'
              }`}
            >
              {text}
            </p>
          )}
        </PhotoBox>

        {match && (
          <div className="flex shrink-0 flex-col gap-3">
            <div className="self-start rounded-md bg-clubtint px-5 py-[9px] text-2xl font-extrabold tracking-[0.14em] text-white uppercase">
              {formatDayHeader(match.date)}
            </div>
            <MatchRow match={match} />
          </div>
        )}
      </div>
    </CanvasFrame>
  )
}
