import { toBlob } from 'html-to-image'

const OPTIONS = {
  pixelRatio: 1,
  width: 1080,
  height: 1920,
  style: { transform: 'none', transformOrigin: 'top left' },
}

async function render(node) {
  // Safari meldt de SVG als geladen voordat de ingesloten afbeeldingen zijn
  // gedecodeerd, waardoor de eerste render ze mist. De tweede render gebruikt
  // de data-URL's die de eerste heeft gecachet en is daarmee wel compleet.
  await toBlob(node, OPTIONS)
  return toBlob(node, OPTIONS)
}

/**
 * Deelt de story's via het native deelmenu (telefoon: rechtstreeks naar
 * Instagram of Facebook), en valt terug op downloads wanneer delen niet
 * beschikbaar is. Meerdere pagina's worden als losse afbeeldingen aangeboden.
 *
 * @param {HTMLElement[]} nodes één node per pagina
 * @param {string} baseName bestandsnaam zonder nummer en extensie
 */
export async function exportPng(nodes, baseName) {
  const files = []
  for (const [index, node] of nodes.entries()) {
    const blob = await render(node)
    const suffix = nodes.length > 1 ? `-${index + 1}` : ''
    files.push(new File([blob], `${baseName}${suffix}.png`, { type: 'image/png' }))
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
