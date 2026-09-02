/**
 * Leest een afbeelding als data-URL, verkleind tot maxW × maxH. Data-URL's zijn
 * nodig omdat html-to-image de canvas niet mag laten "tainten" door een externe
 * bron, en het verkleinen houdt de opslag binnen de localStorage-limiet.
 */
export function fileToDataUrl(file, maxW, maxH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Afbeelding kon niet worden gelezen.'))
    reader.onload = () => {
      // SVG blijft ongemoeid: rasteriseren zou de scherpte weggooien.
      if (file.type === 'image/svg+xml') return resolve(reader.result)

      const img = new Image()
      img.onerror = () => reject(new Error('Afbeelding kon niet worden gelezen.'))
      img.onload = () => {
        const ratio = Math.min(1, maxW / img.width, maxH / img.height)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        // PNG behouden vanwege transparantie (logo's), de rest als JPEG.
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        resolve(canvas.toDataURL(type, 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
