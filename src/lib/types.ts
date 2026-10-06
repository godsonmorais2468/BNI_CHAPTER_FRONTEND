/** Glossy tile colour families, defined as `.t-<tone>` in index.css. */
export type Tone = 'red' | 'gold' | 'navy' | 'green' | 'steel' | 'wine'

export type Role = 'super_admin' | 'region_admin' | 'member'
export type Mode = 'monthly' | 'tenure'
export type Married = 'yes' | 'no' | ''
export type ProfileState = 'pending' | 'saved' | 'skipped'

export interface Region {
  id: string
  name: string
  adminName: string
  adminMobile: string
  adminPin: string
  createdAt: string
}

export interface Plan {
  id: string
  name: string
  description: string
  /** Rate per month, before tax. */
  rate: number
  taxPercent: number
}

export interface Chapter {
  id: string
  regionId: string
  name: string
  city: string
  createdAt: string
}

export interface Profile {
  email: string
  website: string
  social: string
  dob: string
  married: Married
  anniversary: string
  spouse: string
}

export interface Member {
  id: string
  regionId: string
  chapterId: string
  planId: string
  mode: Mode
  amount: number
  designation: string
  name: string
  mobile: string
  pin: string
  organisation: string
  category: string
  photo: string
  createdAt: string
  profile: Profile
  profileState: ProfileState
}

export type MeetingMode = 'online' | 'offline'
export type AttendanceMethod = 'online' | 'qr' | 'geofence'

export interface Meeting {
  id: string
  regionId: string
  chapterId: string
  title: string
  mode: MeetingMode
  /** ISO date-time the meeting starts. */
  startsAt: string
  durationMin: number
  /** Offline meetings only: where it is held and the geofence around it. */
  venue: string
  lat: number | null
  lng: number | null
  /** Members must be within this many metres of the venue to mark attendance by location. */
  radiusM: number
  createdAt: string
}

export interface Attendance {
  id: string
  meetingId: string
  memberId: string
  method: AttendanceMethod
  at: string
  /** Metres from the venue, when marked by location. */
  distanceM?: number
}

export type PayMethod = 'UPI' | 'Card' | 'Net banking'

/** One amount a member owes, and later how it was paid. */
export interface Invoice {
  id: string
  memberId: string
  label: string
  amount: number
  /** YYYY-MM-DD */
  dueDate: string
  status: 'due' | 'paid'
  paidAt?: string
  method?: PayMethod
  /** Receipt number, once paid. */
  ref?: string
}

export interface PollOption {
  id: string
  text: string
}

/** A question the region admin asks a chapter. One answer (radio buttons) or several (checkboxes). */
export interface Poll {
  id: string
  regionId: string
  chapterId: string
  question: string
  multiple: boolean
  options: PollOption[]
  closed: boolean
  createdAt: string
}

export interface Vote {
  id: string
  pollId: string
  memberId: string
  optionIds: string[]
  at: string
}

export interface DB {
  regions: Region[]
  plans: Plan[]
  chapters: Chapter[]
  members: Member[]
  meetings: Meeting[]
  attendance: Attendance[]
  invoices: Invoice[]
  polls: Poll[]
  votes: Vote[]
}

export interface Session {
  role: Role
  id: string
}
