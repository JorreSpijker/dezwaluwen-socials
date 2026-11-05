import { useLayoutEffect, useRef, useState } from 'react'
import { exportPng } from '../lib/export.js'
import { FORMATS, FORMAT_LIST } from '../lib/formats.js'

/**
 * Opbouw van een generator met één afbeelding per formaat: links de preview,
 * rechts de instellingen (op mobiel erboven) en de exportknop. De pagina
 * levert alleen de velden en het canvas.
 *
 * @param {(format: object, ref: Function) => JSX.Element} renderCanvas
 */
export default function Generator({ settings, renderCanvas, fileName, canExport, status }) {
  const [format, setFormat] = useState('story')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)
  const canvasRefs = useRef({})

  // De preview schaalt mee met de beschikbare breedte.
  const frameRef = useRef(null)
  const [scale, setScale] = useState(0.3)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1080)
    })
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [])

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const items = FORMAT_LIST.map((f) => ({
        node: canvasRefs.current[f.key],
        format: f,
        index: 0,
        total: 1,
      }))
      await exportPng(items, fileName)
    } catch (err) {
      setError(`Export mislukt: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  const other = format === 'story' ? FORMATS.post : FORMATS.story

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-32 lg:grid-cols-[1fr_22rem] lg:gap-10 lg:px-8 lg:pb-10">
      <div className="contents lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:block lg:h-[calc(100vh-6.5rem)] lg:self-start lg:overflow-y-auto lg:border-l lg:border-slate-200 lg:pl-8">
        <div className="min-w-0 space-y-5">
          {settings}
          {status}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
            <button
              onClick={handleExport}
              disabled={!canExport || exporting}
              className="mx-auto block w-full max-w-lg rounded-lg bg-[#0b2545] px-4 py-4 text-base font-semibold text-white disabled:opacity-40 lg:max-w-none lg:py-3"
            >
              {exporting ? 'Bezig…' : 'Deel of download PNG'}
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
        <div className="flex gap-2 rounded-lg bg-slate-200 p-1">
          {FORMAT_LIST.map((f) => (
            <button
              key={f.key}
              onClick={() => setFormat(f.key)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                format === f.key
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div
          ref={frameRef}
          className="mx-auto w-full max-w-[420px] overflow-hidden bg-white shadow-lg lg:mx-0 lg:w-[min(100%,calc((100vh-10.5rem)/var(--ratio)))] lg:max-w-none"
          style={{
            height: FORMATS[format].height * scale,
            '--ratio': FORMATS[format].height / FORMATS[format].width,
          }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {renderCanvas(FORMATS[format], (el) => (canvasRefs.current[format] = el))}
          </div>
        </div>
      </div>

      {/* Het formaat dat niet in de preview staat, op ware grootte buiten
          beeld: nodig om mee te exporteren. */}
      <div className="pointer-events-none fixed top-0 left-0 -z-10 opacity-0" aria-hidden="true">
        {renderCanvas(other, (el) => (canvasRefs.current[other.key] = el))}
      </div>
    </div>
  )
}
