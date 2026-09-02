import { format, addDays, subDays, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

const iso = (d) => format(d, 'yyyy-MM-dd')

export const today = () => iso(new Date())
export const nextWeek = () => iso(addDays(new Date(), 7))
export const oneWeekAgo = () => iso(subDays(new Date(), 7))

export const formatDayHeader = (date) => format(date, 'EEEE d MMMM', { locale: nl })
export const formatTime = (date) => format(date, 'HH:mm')
export const formatDayKey = (date) => format(date, 'yyyy-MM-dd')

export function formatRange(from, to) {
  const a = parseISO(from)
  const b = parseISO(to)
  return `${format(a, 'd MMMM', { locale: nl })} t/m ${format(b, 'd MMMM yyyy', { locale: nl })}`
}
