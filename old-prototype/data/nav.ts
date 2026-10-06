import { ArrowLeftRight, CalendarCheck, LayoutGrid, Timer, Users } from 'lucide-react'

export const NAV = [
  { to: '/', label: 'Overview', num: '01', icon: LayoutGrid },
  { to: '/members', label: 'Members', num: '02', icon: Users },
  { to: '/meeting', label: 'Meeting', num: '03', icon: Timer },
  { to: '/attendance', label: 'Attendance', num: '04', icon: CalendarCheck },
  { to: '/referrals', label: 'Referrals', num: '05', icon: ArrowLeftRight },
]
