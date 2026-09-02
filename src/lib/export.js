import { toBlob } from 'html-to-image'

/**
 * Deelt de story via het native deelmenu (telefoon: rechtstreeks naar Instagram
 * of Facebook), en valt terug op een download wanneer delen niet beschikbaar is.
 */
export async function exportPng(node, filename) {
  const blob = await toBlob(node, {
    pixelRatio: 1,
    width: 1080,
    height: 1920,
    cacheBust: true,
    style: { transform: 'none', transformOrigin: 'top left' },
  })

  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
