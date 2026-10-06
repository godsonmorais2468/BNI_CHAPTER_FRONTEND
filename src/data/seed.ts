/* ============================================================
   Demo data. Everything here is invented and lives only in this
   browser (localStorage); swap the store for API calls later.
   ============================================================ */
import type { Attendance, Chapter, DB, Invoice, Meeting, Member, Mode, PayMethod, Plan, Poll, Profile, Region, Vote } from '../lib/types'

export const SUPER_ADMIN = { id: 'sa', name: 'Super Admin', mobile: '9000000001', pin: '1111' }

export const DESIGNATIONS = [
  'President',
  'Vice-President',
  'Secretary/Treasurer',
  'Ambassador',
  'Launch Team',
  'Attendance Coordinator',
  'Education Coordinator',
  'Events Coordinator',
  'Visitor Host',
  'Member',
]

const REGIONS: Region[] = [
  { id: 'rg-kerala', name: 'Trivandrum', adminName: 'Rajesh Menon', adminMobile: '9000000002', adminPin: '2222', createdAt: '2026-01-05T09:00:00.000Z' },
  { id: 'rg-tvm', name: 'Trivandrum', adminName: 'Suresh Kumar', adminMobile: '9000000003', adminPin: '3333', createdAt: '2026-02-11T09:00:00.000Z' },
]

const PLANS: Plan[] = [
  { id: 'pl-silver', name: 'Silver', description: 'Chapter directory and weekly meeting tools for small chapters.', rate: 500, taxPercent: 18 },
  { id: 'pl-gold', name: 'Gold', description: 'Everything in Silver plus attendance reports and referral tracking.', rate: 900, taxPercent: 18 },
  { id: 'pl-platinum', name: 'Platinum', description: 'Everything in Gold plus region-level analytics and priority support.', rate: 1500, taxPercent: 18 },
]

const CHAPTERS: Chapter[] = [
  { id: 'ch-titans', regionId: 'rg-kerala', name: 'Mystics', city: 'Kochi', createdAt: '2026-01-20T09:00:00.000Z' },
  { id: 'ch-falcons', regionId: 'rg-kerala', name: 'Falcons', city: 'Thrissur', createdAt: '2026-03-02T09:00:00.000Z' },
  { id: 'ch-milestones', regionId: 'rg-tvm', name: 'Milestones', city: 'Trivandrum', createdAt: '2026-02-18T09:00:00.000Z' },
  { id: 'ch-majestic', regionId: 'rg-tvm', name: 'Majestic', city: 'Trivandrum', createdAt: '2026-02-25T09:00:00.000Z' },
  { id: 'ch-mascots', regionId: 'rg-tvm', name: 'Mascots', city: 'Trivandrum', createdAt: '2026-03-09T09:00:00.000Z' },
]

type Raw = [name: string, organisation: string, category: string, designation?: string]

const TITANS: Raw[] = [
  ['Arun Karthikeyan', 'Karthikeyan & Co.', 'Chartered Accountant', 'President'],
  ['Anita Joseph', 'Joseph Interiors', 'Interior Designer', 'Vice-President'],
  ['Vivek Nair', 'Nair Legal Associates', 'Corporate Lawyer', 'Secretary/Treasurer'],
  ['Biju Thomas', 'Thomas Builders', 'Residential Builder', 'Ambassador'],
  ['Rijas Khan', 'Khan Insurance Desk', 'General Insurance', 'Ambassador'],
  ['Jyothi Kannan', 'Bloom Dental Studio', 'Dentist', 'Launch Team'],
  ['Rakhesh R', 'Pixelcraft Labs', 'Web Developer', 'Launch Team'],
  ['Meera Pillai', 'Pillai Wealth', 'Financial Planner', 'Visitor Host'],
  ['Sanjay Varghese', 'Varghese Realty', 'Real Estate Agent', 'Ambassador'],
  ['Fathima Rahman', 'Rahman Physio', 'Physiotherapist', 'Launch Team'],
  ['Deepak Menon', 'Menon Events', 'Event Planner', 'Events Coordinator'],
  ['Liya Mathew', 'Petal & Stem', 'Florist & Décor'],
  ['Harish Iyer', 'Iyer Electricals', 'Electrical Contractor', 'Attendance Coordinator'],
  ['Neethu Suresh', 'Suresh Bakes', 'Caterer'],
  ['Ajay Chacko', 'CloudNest IT', 'IT Infrastructure'],
  ['Shabeer Ali', 'Ali Logistics', 'Freight & Logistics'],
  ['Priya Ramesh', 'Ramesh Ayurveda', 'Ayurveda Clinic'],
  ['Tom Abraham', 'Abraham Motors', 'Commercial Vehicles'],
  ['Kavya Nambiar', 'Nambiar HR Solutions', 'HR Consultant', 'Education Coordinator'],
  ['George Kurian', 'Kurian Home Loans', 'Mortgage Advisor'],
  ['Rahul Das', 'Das Print House', 'Printing & Signage'],
  ['Sneha Unnikrishnan', 'SU Digital', 'Digital Marketing'],
  ['Manoj Pothen', 'Pothen Plumbing', 'Plumbing'],
  ['Divya Balan', 'Balan Opticals', 'Optician'],
  ['Akhil Sasi', 'Sasi Solar', 'Solar Energy'],
  ['Reshma Haris', 'Haris Holidays', 'Corporate Travel'],
  ['Jacob Philip', 'Philip & Sons', 'Furniture Maker'],
  ['Nikhil Prasad', 'Prasad Secure', 'CCTV & Security'],
  ['Ann Maria', 'AM Fitness', 'Personal Trainer'],
  ['Sreejith K', 'Sreejith & Associates', 'Company Secretary'],
  ['Lakshmi Varma', 'Varma Couture', 'Fashion Designer'],
  ['Ibrahim Kutty', 'Kutty Pest Control', 'Pest Control'],
]

const TVM: { chapterId: string; rows: Raw[] }[] = [
  {
    chapterId: 'ch-milestones',
    rows: [
      ['Dr Majinu G. Sarath', 'Sarath Dental Care', 'Dentist', 'President'],
      ['Aneesh', 'Aneesh Constructions', 'Civil Contractor', 'Vice-President'],
      ['Yoonus', 'Yoonus & Associates', 'Auditor', 'Secretary/Treasurer'],
    ],
  },
  {
    chapterId: 'ch-majestic',
    rows: [
      ['Arun Kumar N R', 'Kumar Motors', 'Automobile Dealer', 'President'],
      ['Anoop N E', 'NE Interiors', 'Interior Designer', 'Vice-President'],
    ],
  },
  { chapterId: 'ch-mascots', rows: [['Jose Shibu M R', 'Shibu Agencies', 'Insurance Advisor', 'President']] },
]

/* Small deterministic generator so the demo looks the same on every load. */
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const slug = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')
const emptyProfile = (): Profile => ({ email: '', website: '', social: '', dob: '', married: '', anniversary: '', spouse: '' })

function buildMember(raw: Raw, i: number, chapterId: string, regionId: string, mobile: string, pending: boolean): Member {
  const [name, organisation, category, designation = 'Member'] = raw
  const r = seeded(i * 97 + 13 + chapterId.length)
  const plan = PLANS[i % PLANS.length]
  const mode: Mode = i % 3 === 0 ? 'tenure' : 'monthly'
  const months = mode === 'tenure' ? 6 : 1
  const amount = Math.round(plan.rate * months * (1 + plan.taxPercent / 100) * 100) / 100

  let profile = emptyProfile()
  if (!pending) {
    const married = r() < 0.6
    const year = 1968 + Math.floor(r() * 30)
    const mm = String(1 + Math.floor(r() * 12)).padStart(2, '0')
    const dd = String(1 + Math.floor(r() * 28)).padStart(2, '0')
    profile = {
      email: `${name.replace(/^dr\s+/i, '').split(' ')[0].toLowerCase()}@${slug(organisation)}.in`,
      website: r() < 0.7 ? `www.${slug(organisation)}.in` : '',
      social: r() < 0.6 ? `instagram.com/${slug(organisation)}` : '',
      dob: `${year}-${mm}-${dd}`,
      married: married ? 'yes' : 'no',
      anniversary: married ? `${year + 26}-${mm}-${dd}` : '',
      spouse: married ? ['Anju', 'Sreeja', 'Remya', 'Biju', 'Nisha', 'Rahul'][Math.floor(r() * 6)] : '',
    }
  }

  return {
    id: `m-${chapterId}-${i}`,
    regionId,
    chapterId,
    planId: plan.id,
    mode,
    amount,
    designation,
    name,
    mobile,
    pin: '1234',
    organisation,
    category,
    photo: '',
    createdAt: '2026-04-01T09:00:00.000Z',
    profile,
    profileState: pending ? 'pending' : 'saved',
  }
}

/* Two polls for Mystics(one single choice, one multiple choice) and one for Milestones, with some answers already in. */
function buildPolls(members: Member[]): { polls: Poll[]; votes: Vote[] } {
  const opts = (...texts: string[]) => texts.map((text, i) => ({ id: `o${i + 1}`, text }))
  const base = { closed: false, createdAt: new Date().toISOString() }
  const polls: Poll[] = [
    { ...base, id: 'poll-annual', regionId: 'rg-kerala', chapterId: 'ch-titans', question: 'Will you attend the Annual Day on 25 October?', multiple: false, options: opts('Yes, I will attend', 'No, I cannot attend', 'Maybe, will confirm later') },
    { ...base, id: 'poll-workshop', regionId: 'rg-kerala', chapterId: 'ch-titans', question: 'Which days work for the training workshop?', multiple: true, options: opts('Saturday morning', 'Sunday morning', 'Weekday evening', 'Any day') },
    { ...base, id: 'poll-milestones', regionId: 'rg-tvm', chapterId: 'ch-milestones', question: 'Where should we hold the next networking meet?', multiple: false, options: opts('Hotel Residency', 'Community hall', 'Online') },
  ]

  const votes: Vote[] = []
  const at = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString()
  const cast = (m: Member, pollId: string, optionIds: string[]) => votes.push({ id: `v-${votes.length}`, pollId, memberId: m.id, optionIds, at: at(votes.length % 20 + 1) })

  members
    .filter((m) => m.chapterId === 'ch-titans')
    .forEach((m, k) => {
      if (k % 6 !== 5) cast(m, 'poll-annual', [k % 4 === 3 ? 'o3' : k % 4 === 2 ? 'o2' : 'o1'])
      if (k % 3 !== 0 && k !== 1) cast(m, 'poll-workshop', k % 2 ? ['o1', 'o3'] : k % 4 === 0 ? ['o2'] : ['o1', 'o2', 'o3'])
    })
  members
    .filter((m) => m.chapterId === 'ch-milestones')
    .slice(0, 2)
    .forEach((m, k) => cast(m, 'poll-milestones', [k ? 'o2' : 'o1']))
  return { polls, votes }
}

/* Each member gets some paid invoices and, for most, something still due. */
function buildInvoices(members: Member[]): Invoice[] {
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()
  const ymd = (d: Date) => d.toLocaleDateString('en-CA')
  const methods: PayMethod[] = ['UPI', 'Card', 'Net banking']
  const out: Invoice[] = []

  members.forEach((m, k) => {
    const plan = PLANS.find((p) => p.id === m.planId) ?? PLANS[0]
    const paid = (label: string, due: Date, paidOn: Date) =>
      out.push({ id: `inv-${out.length}`, memberId: m.id, label, amount: m.amount, dueDate: ymd(due), status: 'paid', paidAt: paidOn.toISOString(), method: methods[(k + out.length) % 3], ref: `RCPT-${1000 + out.length}` })
    const owed = (label: string, due: Date) => out.push({ id: `inv-${out.length}`, memberId: m.id, label, amount: m.amount, dueDate: ymd(due), status: 'due' })
    const monthLabel = (d: Date) => `${plan.name} · ${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`

    if (m.mode === 'monthly') {
      for (const off of [-3, -2, -1]) {
        const due = new Date(y, mo + off, 10)
        if (off === -1 && k % 4 === 1) owed(monthLabel(due), due)
        else paid(monthLabel(due), due, new Date(y, mo + off, 8))
      }
      const due = new Date(y, mo, 10)
      if (k % 5 === 0) paid(monthLabel(due), due, new Date(y, mo, Math.max(1, now.getDate() - 1)))
      else owed(monthLabel(due), due)
    } else if (k % 2 === 0) {
      paid(`${plan.name} · 6-month tenure`, new Date(y, mo - 6, 5), new Date(y, mo - 6, 3))
      owed(`${plan.name} · 6-month tenure renewal`, new Date(y, mo, 5))
    } else {
      paid(`${plan.name} · 6-month tenure`, new Date(y, mo - 2, 5), new Date(y, mo - 2, 4))
    }
  })
  return out
}

/* A few birthdays and anniversaries land on or near today so the Wishes page always has content. */
function applyWishDays(members: Member[]) {
  const day = (offsetDays: number, year: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return `${year}${d.toLocaleDateString('en-CA').slice(4)}`
  }
  const t = members.filter((m) => m.chapterId === 'ch-titans')
  const bday = (i: number, off: number, year: number) => {
    t[i].profile.dob = day(off, year)
  }
  const anniversary = (i: number, off: number, year: number, spouse: string) => {
    const p = t[i].profile
    p.married = 'yes'
    p.spouse = spouse
    p.anniversary = day(off, year)
  }
  bday(2, 0, 1984)
  bday(5, 0, 1991)
  bday(4, 3, 1979)
  bday(6, 12, 1995)
  bday(8, 21, 1988)
  anniversary(7, 0, 2012, 'Rahul')
  anniversary(9, 0, 2018, 'Imran')
  anniversary(10, 5, 2009, 'Nisha')
  anniversary(11, 26, 2015, 'Joel')
}

/* Meetings are placed around "now" so the demo always has one open for attendance. */
function buildMeetings(members: Member[]): { meetings: Meeting[]; attendance: Attendance[] } {
  const MIN = 60_000
  const DAY = 24 * 60 * MIN
  const now = Date.now()
  const at = (offset: number) => new Date(now + offset).toISOString()
  const base = { durationMin: 90, createdAt: at(-30 * DAY) }

  const meetings: Meeting[] = [
    { ...base, id: 'mt-titans-now', regionId: 'rg-kerala', chapterId: 'ch-titans', title: 'Weekly meeting', mode: 'offline', startsAt: at(20 * MIN), venue: 'SFS Homebridge, Trivandrum', lat: 8.5269869, lng: 76.8878998, radiusM: 100 },
    { ...base, id: 'mt-titans-w1', regionId: 'rg-kerala', chapterId: 'ch-titans', title: 'Weekly meeting', mode: 'offline', startsAt: at(-7 * DAY), venue: 'SFS Homebridge, Trivandrum', lat: 8.5269869, lng: 76.8878998, radiusM: 100 },
    { ...base, id: 'mt-titans-w2', regionId: 'rg-kerala', chapterId: 'ch-titans', title: 'Online networking call', mode: 'online', startsAt: at(-14 * DAY), venue: '', lat: null, lng: null, radiusM: 100 },
    { ...base, id: 'mt-milestones-now', regionId: 'rg-tvm', chapterId: 'ch-milestones', title: 'Weekly meeting (online)', mode: 'online', startsAt: at(10 * MIN), venue: '', lat: null, lng: null, radiusM: 100 },
  ]

  const attendance: Attendance[] = []
  members
    .filter((m) => m.chapterId === 'ch-titans')
    .forEach((m, i) => {
      if (i % 4 !== 3) {
        attendance.push({ id: `at-w1-${i}`, meetingId: 'mt-titans-w1', memberId: m.id, method: i % 2 ? 'geofence' : 'qr', at: at(-7 * DAY + (4 + i) * MIN), distanceM: i % 2 ? 40 + i : undefined })
      }
      if (i % 5 !== 2) {
        attendance.push({ id: `at-w2-${i}`, meetingId: 'mt-titans-w2', memberId: m.id, method: 'online', at: at(-14 * DAY + (2 + i) * MIN) })
      }
    })
  return { meetings, attendance }
}

export function buildSeed(): DB {
  const members: Member[] = TITANS.map((raw, i) => buildMember(raw, i, 'ch-titans', 'rg-kerala', `98460${10001 + i}`, i === 0))
  TVM.forEach((group, g) => {
    group.rows.forEach((raw, i) => {
      members.push(buildMember(raw, i + 1, group.chapterId, 'rg-tvm', `98470${20001 + g * 10 + i}`, false))
    })
  })
  applyWishDays(members)
  const { meetings, attendance } = buildMeetings(members)
  return {
    regions: REGIONS.map((x) => ({ ...x })),
    plans: PLANS.map((x) => ({ ...x })),
    chapters: CHAPTERS.map((x) => ({ ...x })),
    members,
    meetings,
    attendance,
    invoices: buildInvoices(members),
    ...buildPolls(members),
  }
}
