/* ============================================================
   Browser-side data store (localStorage) with typed actions.
   Replace the bodies of these actions with API calls later; the
   pages only talk to what is exported here.
   ============================================================ */
import { useSyncExternalStore } from 'react'
import { SUPER_ADMIN, buildSeed } from '../data/seed'
import { codeValid, distanceM, phaseOf, windowOf } from './attendance'
import { dayOf } from './dues'
import { fmtTime } from './format'
import { priceFor } from './pricing'
import type { AttendanceMethod, Chapter, DB, Invoice, Meeting, Member, Mode, PayMethod, Plan, Poll, Profile, Region, Session } from './types'

const DB_KEY = 'bni-chapter:db:v11'
const SESSION_KEY = 'bni-chapter:session'

export interface ActionResult {
  error?: string
  /** Which form field the error belongs to, when there is one. */
  field?: string
  id?: string
}

/* ---------- persistence ---------- */

function loadDB(): DB {
  try {
    const raw = window.localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DB
      if (parsed.regions && parsed.plans && parsed.chapters && parsed.members && parsed.meetings && parsed.attendance && parsed.invoices && parsed.polls && parsed.votes) return parsed
    }
  } catch {
    /* corrupt or blocked storage — fall back to the demo data */
  }
  return buildSeed()
}

function loadSession(): Session | null {
  for (const store of ['localStorage', 'sessionStorage'] as const) {
    try {
      const raw = window[store].getItem(SESSION_KEY)
      if (raw) return JSON.parse(raw) as Session
    } catch {
      /* blocked storage */
    }
  }
  return null
}

let db: DB = loadDB()
let session: Session | null = loadSession()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: DB) {
  db = next
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* storage full or blocked — the change still lives for this tab */
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useDB = () => useSyncExternalStore(subscribe, () => db)
export const useSession = () => useSyncExternalStore(subscribe, () => session)
export const getDB = () => db

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const iso = () => new Date().toISOString()

/* ---------- helpers ---------- */

export const isMobile = (v: string) => /^\d{10}$/.test(v)
export const isPin = (v: string) => /^\d{4}$/.test(v)

function mobileTaken(mobile: string, exceptMemberId?: string) {
  return (
    mobile === SUPER_ADMIN.mobile ||
    db.regions.some((r) => r.adminMobile === mobile) ||
    db.members.some((m) => m.mobile === mobile && m.id !== exceptMemberId)
  )
}

/* ---------- session ---------- */

export function signIn(mobile: string, pin: string, remember: boolean): Session | null {
  let found: Session | null = null
  if (mobile === SUPER_ADMIN.mobile && pin === SUPER_ADMIN.pin) {
    found = { role: 'super_admin', id: SUPER_ADMIN.id }
  } else {
    const region = db.regions.find((r) => r.adminMobile === mobile && r.adminPin === pin)
    if (region) found = { role: 'region_admin', id: region.id }
    else {
      const member = db.members.find((m) => m.mobile === mobile && m.pin === pin)
      if (member) found = { role: 'member', id: member.id }
    }
  }
  /* Prototype: the right mobile number is enough, whatever PIN was typed. */
  if (!found) {
    if (mobile === SUPER_ADMIN.mobile) found = { role: 'super_admin', id: SUPER_ADMIN.id }
    else {
      const region = db.regions.find((r) => r.adminMobile === mobile)
      const member = db.members.find((m) => m.mobile === mobile)
      if (region) found = { role: 'region_admin', id: region.id }
      else if (member) found = { role: 'member', id: member.id }
    }
  }
  if (!found) return null

  session = found
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
    window.localStorage.removeItem(SESSION_KEY)
    window[remember ? 'localStorage' : 'sessionStorage'].setItem(SESSION_KEY, JSON.stringify(found))
  } catch {
    /* blocked storage — signed in for this tab only */
  }
  emit()
  return found
}

export function signOut() {
  session = null
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* nothing stored */
  }
  emit()
}

export function resetDemo() {
  signOut()
  commit(buildSeed())
}

/* ---------- super admin ---------- */

export function createRegion(input: { name: string; adminName: string; adminMobile: string; adminPin: string }): ActionResult {
  const name = input.name.trim()
  if (db.regions.some((r) => r.name.toLowerCase() === name.toLowerCase())) return { field: 'name', error: 'A region with this name already exists.' }
  if (mobileTaken(input.adminMobile)) return { field: 'adminMobile', error: 'This mobile number is already registered.' }
  const region: Region = { id: uid('rg'), name, adminName: input.adminName.trim(), adminMobile: input.adminMobile, adminPin: input.adminPin, createdAt: iso() }
  commit({ ...db, regions: [...db.regions, region] })
  return { id: region.id }
}

export function createPlan(input: Omit<Plan, 'id'>): ActionResult {
  const name = input.name.trim()
  if (db.plans.some((p) => p.name.toLowerCase() === name.toLowerCase())) return { field: 'name', error: 'A plan with this name already exists.' }
  const plan: Plan = { ...input, name, description: input.description.trim(), id: uid('pl') }
  commit({ ...db, plans: [...db.plans, plan] })
  return { id: plan.id }
}

export function updatePlan(id: string, input: Omit<Plan, 'id'>): ActionResult {
  const name = input.name.trim()
  if (db.plans.some((p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase())) return { field: 'name', error: 'A plan with this name already exists.' }
  commit({ ...db, plans: db.plans.map((p) => (p.id === id ? { ...p, ...input, name, description: input.description.trim() } : p)) })
  return { id }
}

/* ---------- region admin ---------- */

export function createChapter(regionId: string, input: { name: string; city: string }): ActionResult {
  const name = input.name.trim()
  if (db.chapters.some((c) => c.regionId === regionId && c.name.toLowerCase() === name.toLowerCase())) {
    return { field: 'name', error: 'This region already has a chapter with this name.' }
  }
  const chapter: Chapter = { id: uid('ch'), regionId, name, city: input.city.trim(), createdAt: iso() }
  commit({ ...db, chapters: [...db.chapters, chapter] })
  return { id: chapter.id }
}

/* ---------- registration + profile ---------- */

export interface Registration {
  regionId: string
  chapterId: string
  planId: string
  mode: Mode
  designation: string
  name: string
  mobile: string
  pin: string
  photo: string
  organisation: string
  category: string
}

export function registerMember(input: Registration): ActionResult {
  if (mobileTaken(input.mobile)) return { field: 'mobile', error: 'This mobile number is already registered.' }
  const plan = db.plans.find((p) => p.id === input.planId)
  if (!plan) return { error: 'The chosen plan is no longer available.' }
  const member: Member = {
    id: uid('m'),
    regionId: input.regionId,
    chapterId: input.chapterId,
    planId: input.planId,
    mode: input.mode,
    amount: priceFor(plan, input.mode).total,
    designation: input.designation,
    name: input.name.trim(),
    mobile: input.mobile,
    pin: input.pin,
    organisation: input.organisation.trim(),
    category: input.category.trim(),
    photo: input.photo,
    createdAt: iso(),
    profile: { email: '', website: '', social: '', dob: '', married: '', anniversary: '', spouse: '' },
    profileState: 'pending',
  }
  /* Joining creates the first amount to pay. */
  const first: Invoice = {
    id: uid('inv'),
    memberId: member.id,
    label: input.mode === 'tenure' ? `${plan.name} · 6-month tenure` : `${plan.name} · first month`,
    amount: member.amount,
    dueDate: dayOf(Date.now()),
    status: 'due',
  }
  commit({ ...db, members: [...db.members, member], invoices: [...db.invoices, first] })
  return { id: member.id }
}

export function saveProfile(
  id: string,
  input: { designation: string; organisation: string; category: string; photo: string; profile: Profile },
): ActionResult {
  commit({
    ...db,
    members: db.members.map((m) =>
      m.id === id
        ? {
            ...m,
            designation: input.designation,
            organisation: input.organisation.trim(),
            category: input.category.trim(),
            photo: input.photo,
            profile: input.profile,
            profileState: 'saved',
          }
        : m,
    ),
  })
  return { id }
}

export function skipProfile(id: string) {
  commit({ ...db, members: db.members.map((m) => (m.id === id && m.profileState === 'pending' ? { ...m, profileState: 'skipped' } : m)) })
}

/* ---------- meetings + attendance ---------- */

export function createMeeting(input: Omit<Meeting, 'id' | 'createdAt'>): ActionResult {
  const meeting: Meeting = { ...input, title: input.title.trim(), venue: input.venue.trim(), id: uid('mt'), createdAt: iso() }
  commit({ ...db, meetings: [...db.meetings, meeting] })
  return { id: meeting.id }
}

export function deleteMeeting(id: string) {
  commit({ ...db, meetings: db.meetings.filter((m) => m.id !== id), attendance: db.attendance.filter((a) => a.meetingId !== id) })
}

export type AttendanceProof = { method: 'online' } | { method: 'qr'; code: string } | { method: 'geofence'; lat: number; lng: number }

/** Checks the meeting window and the proof, then records the member as present. */
export function markAttendance(memberId: string, meetingId: string, proof: AttendanceProof): ActionResult {
  const member = db.members.find((m) => m.id === memberId)
  const meeting = db.meetings.find((m) => m.id === meetingId)
  if (!member || !meeting || member.chapterId !== meeting.chapterId) return { error: 'This meeting is not available for you.' }
  if (db.attendance.some((a) => a.meetingId === meetingId && a.memberId === memberId)) return { error: 'Your attendance is already marked.' }

  const now = Date.now()
  const phase = phaseOf(meeting, now)
  if (phase === 'upcoming') return { error: `Attendance opens at ${fmtTime(new Date(windowOf(meeting).opensAt).toISOString())}.` }
  if (phase === 'ended') return { error: 'This meeting has ended.' }

  let method: AttendanceMethod
  let distance: number | undefined
  if (meeting.mode === 'online') {
    if (proof.method !== 'online') return { error: 'This is an online meeting.' }
    method = 'online'
  } else if (proof.method === 'qr') {
    if (!codeValid(meeting.id, proof.code, now)) return { field: 'code', error: 'That code is not valid or has expired. Scan the latest QR code.' }
    method = 'qr'
  } else if (proof.method === 'geofence') {
    if (meeting.lat == null || meeting.lng == null) return { error: 'The meeting location is not set.' }
    distance = Math.round(distanceM(proof.lat, proof.lng, meeting.lat, meeting.lng))
    if (distance > meeting.radiusM) return { error: `You are ${distance} m from the venue. Move within ${meeting.radiusM} m to mark attendance.` }
    method = 'geofence'
  } else {
    return { error: 'This meeting is offline. Scan the QR code or use your location.' }
  }

  commit({ ...db, attendance: [...db.attendance, { id: uid('at'), meetingId, memberId, method, at: iso(), distanceM: distance }] })
  return {}
}

/* ---------- dues ---------- */

/** Prototype payment: nothing is charged, the invoices are simply marked paid. `id` in the result is the receipt number. */
export function payInvoices(memberId: string, invoiceIds: string[], method: PayMethod): ActionResult {
  const picked = db.invoices.filter((i) => invoiceIds.includes(i.id) && i.memberId === memberId && i.status === 'due')
  if (picked.length === 0) return { error: 'There is nothing to pay.' }
  const ref = `RCPT-${Date.now().toString(36).toUpperCase().slice(-6)}`
  const paidAt = iso()
  commit({
    ...db,
    invoices: db.invoices.map((i) => (picked.some((p) => p.id === i.id) ? { ...i, status: 'paid', paidAt, method, ref } : i)),
  })
  return { id: ref }
}

/* ---------- RSVP polls ---------- */

export function createPoll(input: { regionId: string; chapterId: string; question: string; multiple: boolean; options: string[] }): ActionResult {
  const poll: Poll = {
    id: uid('poll'),
    regionId: input.regionId,
    chapterId: input.chapterId,
    question: input.question.trim(),
    multiple: input.multiple,
    options: input.options.map((text, i) => ({ id: `o${i + 1}`, text: text.trim() })),
    closed: false,
    createdAt: iso(),
  }
  commit({ ...db, polls: [...db.polls, poll] })
  return { id: poll.id }
}

export function setPollClosed(id: string, closed: boolean) {
  commit({ ...db, polls: db.polls.map((p) => (p.id === id ? { ...p, closed } : p)) })
}

export function deletePoll(id: string) {
  commit({ ...db, polls: db.polls.filter((p) => p.id !== id), votes: db.votes.filter((v) => v.pollId !== id) })
}

/** Records the member's answer, replacing an earlier one. Radio polls take one option, checkbox polls one or more. */
export function submitVote(memberId: string, pollId: string, optionIds: string[]): ActionResult {
  const member = db.members.find((m) => m.id === memberId)
  const poll = db.polls.find((p) => p.id === pollId)
  if (!member || !poll || member.chapterId !== poll.chapterId) return { error: 'This poll is not available for you.' }
  if (poll.closed) return { error: 'This poll is closed.' }
  const chosen = [...new Set(optionIds)].filter((id) => poll.options.some((o) => o.id === id))
  if (chosen.length === 0) return { error: 'Choose an answer first.' }
  if (!poll.multiple && chosen.length > 1) return { error: 'Choose only one answer.' }
  const vote = { id: uid('v'), pollId, memberId, optionIds: chosen, at: iso() }
  commit({ ...db, votes: [...db.votes.filter((v) => !(v.pollId === pollId && v.memberId === memberId)), vote] })
  return { id: vote.id }
}
