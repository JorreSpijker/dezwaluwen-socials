import { toBlob } from 'html-to-image'

/**
 * Deelt de story via het native deelmenu (telefoon: rechtstreeks naar Instagram
 * of Facebook), en valt terug op een download wanneer delen niet beschikbaar is.
 */
export async function exportPng(node, filename) {
  const options = {
    pixelRatio: 1,
    width: 1080,
    height: 1920,
    style: { transform: 'none', transformOrigin: 'top left' },
  }

  // Safari meldt de SVG als geladen voordat de ingesloten afbeeldingen zijn
  // gedecodeerd, waardoor de eerste render ze mist. De tweede render gebruikt
  // de data-URL's die de eerste heeft gecachet en is daarmee wel compleet.
  await toBlob(node, options)
  const blob = await toBlob(node, options)

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
