import { Award, BookUser, CalendarCheck, CalendarClock, House, IndianRupee, Landmark, Layers, ListChecks, Map, PartyPopper } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import type { Role, Tone } from '../lib/types'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<LucideProps>
  tone: Tone
  end?: boolean
  /** Shows a number on the icon: how many dues are pending. */
  badge?: 'dues'
}

export const NAV: Record<Role, NavItem[]> = {
  super_admin: [
    { to: '/admin/regions', label: 'Regions', icon: Map, tone: 'red' },
    { to: '/admin/plans', label: 'Plans', icon: Layers, tone: 'gold' },
  ],
  region_admin: [
    { to: '/region/chapters', label: 'Chapters', icon: Landmark, tone: 'wine' },
    { to: '/region/meetings', label: 'Meetings', icon: CalendarClock, tone: 'gold' },
    { to: '/region/rsvp', label: 'RSVP', icon: ListChecks, tone: 'green' },
  ],
  member: [
    { to: '/', label: 'Home', icon: House, tone: 'gold', end: true },
    { to: '/directory', label: 'E-Directory', icon: BookUser, tone: 'red' },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck, tone: 'green' },
    { to: '/office-bearers', label: 'Office Bearers', icon: Award, tone: 'wine' },
    { to: '/wishes', label: 'Wishes', icon: PartyPopper, tone: 'navy' },
    { to: '/dues', label: 'Dues', icon: IndianRupee, tone: 'gold', badge: 'dues' },
  ],
}

export const HOME: Record<Role, string> = {
  super_admin: '/admin/regions',
  region_admin: '/region/chapters',
  member: '/',
}
