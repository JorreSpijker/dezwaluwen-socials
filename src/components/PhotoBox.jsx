import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Het fotovlak: vult de vrije hoogte. Bij 'cover' vult de foto het hele vlak
 * en wordt bijgesneden; bij 'contain' krimpt het vlak tot de verhouding van
 * de foto, zodat er geen lege rand overblijft.
 *
 * Wat als children meekomt staat direct onder de foto; alles lijnt dan vanaf
 * boven uit en de ruimte die overblijft valt onderaan.
 *
 * De maten staan in pixels, gemeten en berekend: Safari laat percentages
 * vallen bij het exporteren. Om dezelfde reden een achtergrond in plaats van
 * een <img> met object-fit.
 *
 * Met `padding` (voor een logo) krijgt een geplaatste afbeelding een witte
 * achtergrond met die ruimte eromheen.
 */
export default function PhotoBox({ photo, fit, empty, gap = 0, padding = 0, children }) {
  const areaRef = useRef(null)
  const belowRef = useRef(null)
  const [area, setArea] = useState(null)
  const [ratio, setRatio] = useState(null)

  // offsetWidth/-Height negeren de transform van de preview, dus dit zijn de
  // maten op ware grootte.
  useLayoutEffect(() => {
    const measure = () => {
      const below = belowRef.current ? belowRef.current.offsetHeight + gap : 0
      setArea({ width: areaRef.current.offsetWidth, height: areaRef.current.offsetHeight - below })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(areaRef.current)
    if (belowRef.current) observer.observe(belowRef.current)
    return () => observer.disconnect()
  }, [gap, Boolean(children)])

  useEffect(() => {
    if (!photo) return setRatio(null)
    const img = new Image()
    img.onload = () => setRatio(img.naturalWidth / img.naturalHeight)
    img.src = photo
  }, [photo])

  let size = area
  if (fit === 'contain' && area && ratio) {
    const inner = { width: area.width - 2 * padding, height: area.height - 2 * padding }
    const fitted =
      inner.width / inner.height > ratio
        ? { width: Math.round(inner.height * ratio), height: inner.height }
        : { width: inner.width, height: Math.round(inner.width / ratio) }
    size = { width: fitted.width + 2 * padding, height: fitted.height + 2 * padding }
  }
  const padded = Boolean(padding && photo)

  return (
    <div
      ref={areaRef}
      style={{ gap }}
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
        children ? 'justify-start' : 'items-center justify-center'
      }`}
    >
      {size && (
        <div
          style={{
            width: size.width,
            height: size.height,
            backgroundImage: photo ? `url(${photo})` : undefined,
            padding: padded ? padding : undefined,
          }}
          className={`shrink-0 rounded-2xl bg-center ${
            padded ? 'bg-white bg-contain bg-origin-content bg-no-repeat' : 'bg-surface bg-cover'
          }`}
        >
          {!photo && <p className="pt-24 text-center text-[40px] text-muted">{empty}</p>}
        </div>
      )}
      {children && (
        <div ref={belowRef} style={{ gap }} className="flex shrink-0 flex-col">
          {children}
        </div>
      )}
    </div>
  )
}
