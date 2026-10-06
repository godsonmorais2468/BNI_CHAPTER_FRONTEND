import { BookUser, House, Layers, Map, Landmark } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import type { Role } from '../lib/types'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<LucideProps>
  end?: boolean
}

export const NAV: Record<Role, NavItem[]> = {
  super_admin: [
    { to: '/admin/regions', label: 'Regions', icon: Map },
    { to: '/admin/plans', label: 'Plans', icon: Layers },
  ],
  region_admin: [{ to: '/region/chapters', label: 'Chapters', icon: Landmark }],
  member: [
    { to: '/', label: 'Home', icon: House, end: true },
    { to: '/directory', label: 'E-Directory', icon: BookUser },
  ],
}

export const HOME: Record<Role, string> = {
  super_admin: '/admin/regions',
  region_admin: '/region/chapters',
  member: '/',
}
