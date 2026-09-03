import { format, addDays, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

const iso = (d) => format(d, 'yyyy-MM-dd')

export const today = () => iso(new Date())
export const nextWeek = () => iso(addDays(new Date(), 7))
export const oneWeekAgo = () => iso(subDays(new Date(), 7))

/** Kalenderweek (maandag t/m zondag) waarin vandaag valt. */
export const thisWeek = () => [
  iso(startOfWeek(new Date(), { weekStartsOn: 1 })),
  iso(endOfWeek(new Date(), { weekStartsOn: 1 })),
]

/** yyyy-MM-dd (waarde van een date-input) naar dd-MM-yyyy voor weergave. */
export const formatInputDate = (value) => (value ? format(parseISO(value), 'dd-MM-yyyy') : '')

/** yyyy-MM-dd plus HH:mm naar een Date in de lokale tijdzone. */
export function parseDateTime(date, time) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

export const formatDayHeader = (date) => format(date, 'EEEE d MMMM', { locale: nl })
export const formatTime = (date) => format(date, 'HH:mm')
export const formatDayKey = (date) => format(date, 'yyyy-MM-dd')

/** Accepteert zowel yyyy-MM-dd-strings als Date-objecten. */
export function formatRange(from, to) {
  const a = typeof from === 'string' ? parseISO(from) : from
  const b = typeof to === 'string' ? parseISO(to) : to
  return `${format(a, 'd MMMM', { locale: nl })} t/m ${format(b, 'd MMMM yyyy', { locale: nl })}`
}
