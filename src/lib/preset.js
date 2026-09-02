import { slug } from './slug.js'

const EMAIL = 'jorre@dezwaluwen.nl'

/** Het object zoals het in clubs.json moet komen; afbeeldingen als data-URL. */
function buildPreset(club) {
  return {
    id: slug(club.name),
    name: club.name,
    clubCode: club.clubCode,
    handle: club.handle,
    logo: club.logo,
    background: club.background,
    colors: club.colors,
  }
}

/**
 * Biedt de preset aan als JSON-bestand. Op mobiel via het deelmenu, zodat het
 * bestand als bijlage in een mail belandt; daar is de ontvanger niet vooraf in
 * te vullen. Anders downloaden en een concept openen — mailto kan geen
 * bijlagen meenemen, dus de gebruiker hangt het bestand er zelf aan.
 */
export async function sharePreset(club) {
  const preset = buildPreset(club)
  const filename = `${preset.id}-preset.json`
  const file = new File([JSON.stringify(preset, null, 2)], filename, {
    type: 'application/json',
  })
  const subject = `Club preset aanvraag: ${club.name}`
  const intro = `Hoi Jorre,\n\nHierbij de gegevens voor ${club.name} (clubcode ${club.clubCode}).\n`

  if (navigator.canShare?.({ files: [file] })) {
    try {
      // Het deelmenu kent geen ontvanger, dus die staat in de tekst zelf.
      await navigator.share({
        files: [file],
        title: subject,
        text: `Stuur naar ${EMAIL}\n\n${intro}`,
      })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)

  const body = `${intro}\nHet bestand ${filename} is zojuist gedownload. Voeg het toe als bijlage.\n`
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return 'downloaded'
}
