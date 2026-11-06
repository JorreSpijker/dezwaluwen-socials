import { FORMATS } from '../lib/formats.js'
import CanvasFrame from './CanvasFrame.jsx'

export default function SpotlightCanvas({
  ref,
  photo,
  logo,
  name,
  text,
  website,
  fit = 'cover',
  format = FORMATS.story,
}) {
  const compact = format.key === 'post'
  // Vaste pixelmaten en een achtergrond in plaats van <img>: zie PhotoBox.
  const logoSize = compact ? 120 : 160
  const photoSize = { width: format.width - 128, height: compact ? 440 : 680 }
  const gap = compact ? 22 : 34

  return (
    <CanvasFrame
      ref={ref}
      title={
        <>
          IN DE
          <br />
          SPOTLIGHT
        </>
      }
      subtitle="Onze sponsor"
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
        {(logo || name || website) && (
          <div className={`flex items-center ${compact ? 'gap-[22px]' : 'gap-[30px]'}`}>
            {logo && (
              <div className="shrink-0 rounded-2xl bg-white p-4">
                <div
                  style={{ width: logoSize, height: logoSize, backgroundImage: `url(${logo})` }}
                  className="bg-contain bg-center bg-no-repeat"
                ></div>
              </div>
            )}
            <div className="flex min-w-0 flex-col gap-2">
              {name && (
                <h2
                  className={`leading-[1.05] font-black tracking-[-0.03em] text-clubdeep ${
                    compact ? 'text-[48px]' : 'text-[64px]'
                  }`}
                >
                  {name}
                </h2>
              )}
              {website && (
                <div
                  className={`font-barlow font-semibold tracking-[0.04em] text-club ${
                    compact ? 'text-[24px]' : 'text-[30px]'
                  }`}
                >
                  {website}
                </div>
              )}
            </div>
          </div>
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
      </div>
    </CanvasFrame>
  )
}
