import { formatDayHeader } from '../lib/dates.js'
import { FORMATS } from '../lib/formats.js'
import CanvasFrame from './CanvasFrame.jsx'
import PhotoBox from './PhotoBox.jsx'
import MatchRow from './MatchRow.jsx'

export default function BallSponsorCanvas({ ref, logo, name, text, match, format = FORMATS.story }) {
  const compact = format.key === 'post'

  return (
    <CanvasFrame
      ref={ref}
      title={
        <>
          BAL
          <br />
          SPONSOR
        </>
      }
      subtitle="De wedstrijdbal wordt aangeboden door"
      format={format}
    >
      <div className={`flex min-h-0 flex-1 flex-col ${compact ? 'gap-[22px]' : 'gap-[34px]'}`}>
        <PhotoBox
          photo={logo}
          fit="contain"
          padding={compact ? 32 : 48}
          empty="Nog geen logo"
          gap={compact ? 22 : 34}
        >
          {name && (
            <h2
              className={`leading-[1.05] font-black tracking-[-0.03em] text-clubdeep ${
                compact ? 'text-[48px]' : 'text-[64px]'
              }`}
            >
              {name}
            </h2>
          )}

          {text && (
            <p
              className={`font-medium whitespace-pre-line text-muted ${
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
