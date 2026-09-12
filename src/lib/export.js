import { toBlob } from 'html-to-image'

const options = (format) => ({
  pixelRatio: 1,
  width: format.width,
  height: format.height,
  style: { transform: 'none', transformOrigin: 'top left' },
})

async function render(node, format) {
  // Safari meldt de SVG als geladen voordat de ingesloten afbeeldingen zijn
  // gedecodeerd, waardoor de eerste render ze mist. De tweede render gebruikt
  // de data-URL's die de eerste heeft gecachet en is daarmee wel compleet.
  await toBlob(node, options(format))
  return toBlob(node, options(format))
}

/**
 * Deelt de story's via het native deelmenu (telefoon: rechtstreeks naar
 * Instagram of Facebook), en valt terug op downloads wanneer delen niet
 * beschikbaar is. Meerdere pagina's worden als losse afbeeldingen aangeboden.
 *
 * @param {{node: HTMLElement, format: object, index: number, total: number}[]} items
 *   één item per pagina, per formaat
 * @param {string} baseName bestandsnaam zonder formaat, nummer en extensie
 */
export async function exportPng(items, baseName) {
  const files = []
  for (const { node, format, index, total } of items) {
    const blob = await render(node, format)
    const suffix = total > 1 ? `-${index + 1}` : ''
    files.push(
      new File([blob], `${baseName}-${format.key}${suffix}.png`, { type: 'image/png' }),
    )
  }

  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'
    }
  }

  for (const file of files) {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
  }
  return 'downloaded'
}
