import { FORMATS } from '../lib/formats.js'
import CanvasFrame from './CanvasFrame.jsx'

export default function IntroductionCanvas({
  ref,
  photo,
  name,
  team,
  questions,
  fit = 'cover',
  format = FORMATS.story,
}) {
  const compact = format.key === 'post'
  // Alleen beantwoorde vragen komen op de afbeelding.
  const answered = questions.filter((q) => q.question && q.answer)
  // Vaste maat in pixels, zodat er ruimte blijft voor de vragen. Een
  // achtergrond in plaats van <img>: zie PhotoBox.
  const photoSize = { width: format.width - 128, height: compact ? 440 : 680 }
  const gap = compact ? 22 : 34

  return (
    <CanvasFrame
      ref={ref}
      title={
        <>
          VOORSTEL
          <br />
          RONDJE
        </>
      }
      format={format}
    >
      <div style={{ gap }} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          style={{ ...photoSize, backgroundImage: photo ? `url(${photo})` : undefined }}
          className={`shrink-0 rounded-2xl bg-surface bg-center bg-no-repeat ${
            fit === 'contain' ? 'bg-contain' : 'bg-cover'
          }`}
        >
          {!photo && <p className="pt-24 text-center text-[40px] text-muted">Nog geen foto</p>}
        </div>
        {(name || team) && (
          <div className="flex flex-col gap-2">
            {name && (
              <h2
                className={`leading-[1.05] font-black tracking-[-0.03em] text-clubdeep ${
                  compact ? 'text-[48px]' : 'text-[64px]'
                }`}
              >
                {name}
              </h2>
            )}
            {team && (
              <div
                className={`font-barlow font-semibold tracking-[0.04em] text-clubdeep ${
                  compact ? 'text-[24px]' : 'text-[30px]'
                }`}
              >
                {team}
              </div>
            )}
          </div>
        )}

        {answered.length > 0 && (
          <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-5'}`}>
            {answered.map((q, i) => (
              <div key={i}>
                <div
                  className={`font-barlow font-semibold tracking-[0.04em] text-club ${
                    compact ? 'text-[22px]' : 'text-[27px]'
                  }`}
                >
                  {q.question}
                </div>
                <div
                  className={`font-medium text-clubdeep ${
                    compact ? 'text-[28px] leading-[1.25]' : 'text-[34px] leading-[1.3]'
                  }`}
                >
                  {q.answer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CanvasFrame>
  )
}
