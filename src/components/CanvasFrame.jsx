import { FORMATS } from '../lib/formats.js'

/**
 * De huisstijl die alle templates delen: clubfoto als achtergrond, blauwe
 * balk, logo met titel, een lijn eronder en de voet met clubnaam en handle.
 * De inhoud daartussen vult de vrije hoogte.
 */
export default function CanvasFrame({ ref, title, subtitle, format = FORMATS.story, children }) {
  // De post is lager dan de story: kop en voet krimpen mee.
  const compact = format.key === 'post'

  return (
    <div
      ref={ref}
      style={{ width: format.width, height: format.height }}
      className="relative flex shrink-0 flex-col overflow-hidden bg-white font-archivo"
    >
      {/* Clubfoto als achtergrond: onder een witte gradient, zodat er kleur
          doorschemert zonder de leesbaarheid te raken. De blur zit in het
          bestand zelf: Safari laat een CSS-filter vallen bij het exporteren.
          Om dezelfde reden staan hier vaste pixelmaten in plaats van inset-0
          en size-full — percentages klappen daar dicht naar 0. */}
      <div
        style={{ width: format.width, height: format.height }}
        className="absolute top-0 left-0 overflow-hidden"
      >
        <img src="/bg-blur.jpg" alt="" width="1080" height="1920" />
        <div
          style={{ width: format.width, height: format.height }}
          className="absolute top-0 left-0 bg-gradient-to-b from-white/62 via-white/56 to-white"
        ></div>
      </div>

      <div className={`relative shrink-0 bg-club ${compact ? 'h-[12px]' : 'h-[18px]'}`}></div>
      <div
        className={`relative flex min-h-0 flex-1 flex-col px-16 ${
          compact ? 'pt-[24px] pb-9' : 'pt-[36px] pb-14'
        }`}
      >
        <div className={`flex items-center ${compact ? 'gap-[24px]' : 'gap-[34px]'}`}>
          <img
            src="/logo.svg"
            alt="KV De Zwaluwen"
            className={`h-auto shrink-0 ${compact ? 'w-[180px]' : 'w-[260px]'}`}
          />
          <div className={`flex min-w-0 flex-col ${compact ? 'gap-1.5' : 'gap-2.5'}`}>
            <div
              className={`leading-[0.9] font-black tracking-[-0.075em] text-club ${
                compact ? 'text-[66px]' : 'text-[96px]'
              }`}
            >
              {title}
            </div>
            {subtitle && (
              <div
                className={`font-barlow font-semibold tracking-[0.06em] text-muted ${
                  compact ? 'text-[23px]' : 'text-[30px]'
                }`}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div
          className={`h-[3px] shrink-0 bg-club ${
            compact ? 'mt-[24px] mb-[22px]' : 'mt-[38px] mb-[34px]'
          }`}
        ></div>

        {children}

        <div
          className={`flex shrink-0 items-center justify-between border-t-2 border-rule ${
            compact ? 'mt-[22px] pt-5' : 'mt-[34px] pt-7'
          }`}
        >
          <div
            className={`font-bold text-clubdeep ${compact ? 'text-[22px]' : 'text-[27px]'}`}
          >
            KV de Zwaluwen
          </div>
          <div
            className={`font-barlow font-semibold tracking-[0.04em] text-club ${
              compact ? 'text-[22px]' : 'text-[27px]'
            }`}
          >
            @kvdezwaluwen
          </div>
        </div>
      </div>
    </div>
  )
}
