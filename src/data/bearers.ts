import { Award, ClipboardList, Crown, Handshake, Rocket, Wallet } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import type { Tone } from '../lib/types'

export interface BearerGroup {
  key: string
  title: string
  icon: ComponentType<LucideProps>
  tone: Tone
  /** Decides whether a member's designation belongs to this group. */
  match: (designation: string) => boolean
}

const norm = (d: string) => d.trim().toLowerCase().replace(/[-_]+/g, ' ')

/** Shown in this order on the Office Bearers page. */
export const BEARER_GROUPS: BearerGroup[] = [
  {
    key: 'president',
    title: 'President',
    icon: Crown,
    tone: 'red',
    match: (d) => norm(d) === 'president',
  },
  {
    key: 'vice-president',
    title: 'Vice President',
    icon: Award,
    tone: 'gold',
    match: (d) => norm(d) === 'vice president',
  },
  {
    key: 'secretary-treasurer',
    title: 'Secretary / Treasurer',
    icon: Wallet,
    tone: 'navy',
    match: (d) => /^(secretary|treasurer)/.test(norm(d)),
  },
  {
    key: 'ambassadors',
    title: 'Ambassadors',
    icon: Handshake,
    tone: 'green',
    match: (d) => norm(d).startsWith('ambassador'),
  },
  {
    key: 'launch-team',
    title: 'Launch Team',
    icon: Rocket,
    tone: 'wine',
    match: (d) => norm(d).includes('launch'),
  },
  {
    key: 'coordinators',
    title: 'Coordinators',
    icon: ClipboardList,
    tone: 'steel',
    match: (d) => norm(d).includes('coordinator') || norm(d) === 'visitor host',
  },
]
