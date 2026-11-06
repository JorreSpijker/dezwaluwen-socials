import {
  CalendarDays,
  Hand,
  House,
  Newspaper,
  Sparkles,
  Trophy,
  Users,
  Volleyball,
} from 'lucide-react'

/**
 * De menu-items in menuvolgorde. Het id is ook het pad: `/<id>`, home is `/`.
 * Zonder `ready` toont de app nog een placeholder.
 */
export const PAGES = [
  { id: 'home', label: 'Home', icon: House, ready: true },
  {
    id: 'programma',
    label: 'Programma',
    icon: CalendarDays,
    description: 'Wedstrijden van de komende week.',
    ready: true,
  },
  {
    id: 'uitslagen',
    label: 'Uitslagen',
    icon: Trophy,
    description: 'Uitslagen van de afgelopen week.',
    ready: true,
  },
  {
    id: 'team-van-de-week',
    label: 'Team van de week',
    icon: Users,
    description: 'Teamfoto met tekst en de wedstrijd van Zwaluwen 1.',
    ready: true,
  },
  {
    id: 'balsponsor',
    label: 'Balsponsor',
    icon: Volleyball,
    description: 'De sponsor van de wedstrijdbal.',
    ready: true,
  },
  {
    id: 'laatste-nieuws',
    label: 'Laatste nieuws',
    icon: Newspaper,
    description: 'Nieuwsbericht met foto, kop en tekst.',
    ready: true,
  },
  {
    id: 'sponsor-in-de-spotlight',
    label: 'Sponsor in de spotlight',
    icon: Sparkles,
    description: 'Eén sponsor uitgelicht.',
    ready: true,
  },
  {
    id: 'voorstelrondje',
    label: 'Voorstelrondje',
    icon: Hand,
    description: 'Leden stellen zich voor.',
    ready: true,
  },
]

export const pagePath = (id) => (id === 'home' ? '/' : `/${id}`)
