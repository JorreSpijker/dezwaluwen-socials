import { FORMATS } from '../lib/formats.js'
import CanvasFrame from './CanvasFrame.jsx'
import PhotoBox from './PhotoBox.jsx'

export default function NewsCanvas({ ref, photo, title, text, date, fit = 'cover', format = FORMATS.story }) {
  const compact = format.key === 'post'

  return (
    <CanvasFrame
      ref={ref}
      title={
        <>
          LAATSTE
          <br />
          NIEUWS
        </>
      }
      subtitle={date}
      format={format}
    >
      <PhotoBox photo={photo} fit={fit} empty="Nog geen foto" gap={compact ? 22 : 34}>
        {title && (
          <h2
            className={`leading-[1.05] font-black tracking-[-0.03em] text-clubdeep ${
              compact ? 'text-[48px]' : 'text-[64px]'
            }`}
          >
            {title}
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
    </CanvasFrame>
  )
}
