import clubs from './clubs.json'

export const CLUBS = clubs
export const CUSTOM_ID = 'overig'

export const CUSTOM_DEFAULT = {
  id: CUSTOM_ID,
  name: '',
  clubCode: '',
  handle: '',
  logo: null,
  background: null,
  colors: { club: '#005daa', clubdeep: '#0b3d6b', clubtint: '#1c7fcb' },
}

const CUSTOM_KEY = 'socials.customClub'
const SELECTED_KEY = 'socials.club'

export function loadCustom() {
  try {
    const stored = JSON.parse(localStorage.getItem(CUSTOM_KEY))
    return stored ? { ...CUSTOM_DEFAULT, ...stored } : CUSTOM_DEFAULT
  } catch {
    return CUSTOM_DEFAULT
  }
}

export function saveCustom(config) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(config))
  } catch {
    throw new Error('Opslag vol — kies een kleinere afbeelding.')
  }
}

export function loadSelectedId() {
  return localStorage.getItem(SELECTED_KEY) ?? CLUBS[0].id
}

export function saveSelectedId(id) {
  localStorage.setItem(SELECTED_KEY, id)
}
