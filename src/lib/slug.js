/** Clubnaam naar een vorm die bruikbaar is als bestandsnaam en als club-id. */
export function slug(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'club'
  )
}
