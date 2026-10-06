/* ============================================================
   Prototype data. Everything here is invented and lives only in
   the browser; swap these exports for API calls later.
   ============================================================ */
import { addDays, isoWeek, nextMeeting } from '../lib/format'

export type Team = 'Property' | 'Finance' | 'Health' | 'Events' | 'Business' | 'Tech'
export type Palms = 'P' | 'A' | 'L' | 'M' | 'S'
export type Stage = 'passed' | 'contacted' | 'meeting' | 'closed'

/** Glossy tile colour families, defined as `.t-<tone>` in index.css. */
export type Tone = 'red' | 'gold' | 'navy' | 'green' | 'steel' | 'wine'

export const TEAMS: Record<Team, { label: string; tone: Tone }> = {
  Property: { label: 'Property & Build', tone: 'navy' },
  Finance: { label: 'Finance & Legal', tone: 'red' },
  Health: { label: 'Health & Wellness', tone: 'green' },
  Events: { label: 'Events & Lifestyle', tone: 'gold' },
  Business: { label: 'Business Services', tone: 'wine' },
  Tech: { label: 'Technology', tone: 'steel' },
}

export const PALMS_META: Record<Palms, { label: string; long: string }> = {
  P: { label: 'P', long: 'Present' },
  A: { label: 'A', long: 'Absent' },
  L: { label: 'L', long: 'Late' },
  M: { label: 'M', long: 'Medical' },
  S: { label: 'S', long: 'Substitute' },
}

export const CHAPTER = {
  name: 'Titans',
  city: 'Kochi',
  region: 'Kerala Central',
  venue: 'The Renai Cochin, Palarivattom',
  founded: 2016,
  seats: 40,
}

export interface Member {
  id: string
  name: string
  business: string
  category: string
  team: Team
  ask: string
  role?: string
  phone: string
  email: string
  since: number
  renewal: Date
  given: number
  received: number
  oneToOnes: number
  tyfcb: number
  ceu: number
  visitors: number
  palms: Palms[]
}

type Raw = [name: string, business: string, category: string, team: Team, ask: string, role?: string]

const RAW: Raw[] = [
  ['Arun Karthikeyan', 'Karthikeyan & Co.', 'Chartered Accountant', 'Finance', 'Owners of manufacturing firms preparing for GST audits', 'President'],
  ['Anita Joseph', 'Joseph Interiors', 'Interior Designer', 'Property', 'Families who just bought a new apartment in Kakkanad', 'Vice President'],
  ['Vivek Nair', 'Nair Legal Associates', 'Corporate Lawyer', 'Finance', 'Start-up founders raising their first round', 'Secretary / Treasurer'],
  ['Biju Thomas', 'Thomas Builders', 'Residential Builder', 'Property', 'Landowners looking at joint-venture villa projects'],
  ['Rijas Khan', 'Khan Insurance Desk', 'General Insurance', 'Finance', 'HR heads renewing group health policies'],
  ['Jyothi Kannan', 'Bloom Dental Studio', 'Dentist', 'Health', 'Corporate wellness managers'],
  ['Rakhesh R', 'Pixelcraft Labs', 'Web Developer', 'Tech', 'Clinics that still don’t take online bookings'],
  ['Meera Pillai', 'Pillai Wealth', 'Financial Planner', 'Finance', 'Doctors planning for retirement', 'Visitor Host'],
  ['Sanjay Varghese', 'Varghese Realty', 'Real Estate Agent', 'Property', 'NRIs looking to sell inherited property'],
  ['Fathima Rahman', 'Rahman Physio', 'Physiotherapist', 'Health', 'Orthopaedic surgeons in Ernakulam'],
  ['Deepak Menon', 'Menon Events', 'Event Planner', 'Events', 'Companies planning year-end team offsites'],
  ['Liya Mathew', 'Petal & Stem', 'Florist & Décor', 'Events', 'Wedding planners and hotel banquet managers'],
  ['Harish Iyer', 'Iyer Electricals', 'Electrical Contractor', 'Property', 'Builders handing over flats this quarter'],
  ['Neethu Suresh', 'Suresh Bakes', 'Caterer', 'Events', 'Office admins who order team lunches'],
  ['Ajay Chacko', 'CloudNest IT', 'IT Infrastructure', 'Tech', 'Schools upgrading their computer labs'],
  ['Shabeer Ali', 'Ali Logistics', 'Freight & Logistics', 'Business', 'Exporters shipping to the Gulf'],
  ['Priya Ramesh', 'Ramesh Ayurveda', 'Ayurveda Clinic', 'Health', 'Yoga studio owners'],
  ['Tom Abraham', 'Abraham Motors', 'Commercial Vehicles', 'Business', 'Fleet managers replacing delivery vans'],
  ['Kavya Nambiar', 'Nambiar HR Solutions', 'HR Consultant', 'Business', 'Founders hiring their first 20 employees', 'Education Coordinator'],
  ['George Kurian', 'Kurian Home Loans', 'Mortgage Advisor', 'Finance', 'First-time home buyers'],
  ['Rahul Das', 'Das Print House', 'Printing & Signage', 'Business', 'Restaurants launching new outlets'],
  ['Sneha Unnikrishnan', 'SU Digital', 'Digital Marketing', 'Tech', 'Retailers moving online before the festive season'],
  ['Manoj Pothen', 'Pothen Plumbing', 'Plumbing', 'Property', 'Apartment association secretaries'],
  ['Divya Balan', 'Balan Opticals', 'Optician', 'Health', 'School principals running eye-check camps'],
  ['Akhil Sasi', 'Sasi Solar', 'Solar Energy', 'Property', 'Factories with large flat roofs'],
  ['Reshma Haris', 'Haris Holidays', 'Corporate Travel', 'Events', 'Companies planning incentive trips'],
  ['Jacob Philip', 'Philip & Sons', 'Furniture Maker', 'Property', 'Interior designers with hotel projects'],
  ['Nikhil Prasad', 'Prasad Secure', 'CCTV & Security', 'Tech', 'Jewellery store owners'],
  ['Ann Maria', 'AM Fitness', 'Personal Trainer', 'Health', 'HR teams running fitness challenges'],
  ['Sreejith K', 'Sreejith & Associates', 'Company Secretary', 'Finance', 'Private limited companies with annual filings due'],
  ['Lakshmi Varma', 'Varma Couture', 'Fashion Designer', 'Events', 'Brides planning winter weddings'],
  ['Ibrahim Kutty', 'Kutty Pest Control', 'Pest Control', 'Business', 'Hotel and restaurant operations managers'],
]

/* Small deterministic generator so the numbers stay put between reloads. */
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const TODAY = new Date()
export const NEXT_MEETING = nextMeeting(TODAY)
export const WEEK = isoWeek(NEXT_MEETING)

/** The eight meetings before the next one, oldest first. */
export const MEETING_DATES = Array.from({ length: 8 }, (_, k) => addDays(NEXT_MEETING, -7 * (8 - k)))

function slug(s: string) {
  return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '')
}

export const MEMBERS: Member[] = RAW.map(([name, business, category, team, ask, role], i) => {
  const r = seeded(i * 97 + 13)
  const palms: Palms[] = Array.from({ length: 8 }, () => {
    const x = r()
    return x < 0.82 ? 'P' : x < 0.88 ? 'L' : x < 0.93 ? 'S' : x < 0.97 ? 'A' : 'M'
  })
  const num = `9${846000000 + i * 12347}`
  return {
    id: `m${i + 1}`,
    name,
    business,
    category,
    team,
    ask,
    role,
    phone: `+91 ${num.slice(0, 5)} ${num.slice(5)}`,
    email: `${name.split(' ')[0].toLowerCase()}@${slug(business)}.in`,
    since: 2016 + (i % 9),
    renewal: addDays(TODAY, ((i * 53 + 40) % 360) - 12),
    given: 4 + Math.floor(r() * 18),
    received: 3 + Math.floor(r() * 16),
    oneToOnes: 2 + Math.floor(r() * 10),
    tyfcb: Math.round((60000 + r() * 1400000) / 1000) * 1000,
    ceu: Math.floor(r() * 12),
    visitors: Math.floor(r() * 4),
    palms,
  }
})

export const memberById = (id: string) => MEMBERS.find((m) => m.id === id)

export const OPEN_CATEGORIES = [
  'Architect',
  'Photographer',
  'Paediatrician',
  'Car Rentals',
  'Stock Broker',
  'Cybersecurity',
  'Landscaping',
  'Video Production',
]

/* Last twelve weeks, oldest first. */
const WEEKLY_ATTENDANCE = [92, 95, 88, 97, 94, 91, 96, 93, 98, 95, 94, 97]
const WEEKLY_REFERRALS = [24, 29, 31, 22, 35, 28, 33, 30, 27, 36, 34, 38]
const WEEKLY_VISITORS = [3, 5, 2, 6, 4, 3, 7, 5, 4, 6, 5, 7]
const WEEKLY_TYFCB = [9.2, 11.4, 8.1, 12.6, 10.3, 13.9, 9.8, 12.2, 14.1, 11.7, 13.0, 14.6]
const WEEKLY_121 = [14, 18, 16, 21, 17, 19, 15, 22, 20, 18, 19, 22]

export const WEEKLY = WEEKLY_ATTENDANCE.map((attendance, i) => ({
  label: `W${WEEK - 12 + i}`,
  attendance,
  referrals: WEEKLY_REFERRALS[i],
  visitors: WEEKLY_VISITORS[i],
  tyfcb: WEEKLY_TYFCB[i] * 1e5,
  oneToOnes: WEEKLY_121[i],
}))

export interface Referral {
  id: string
  from: string
  to: string
  prospect: string
  need: string
  value: number
  temp: 1 | 2 | 3
  stage: Stage
  days: number
}

export const REFERRALS: Referral[] = [
  { id: 'r1', from: 'm2', to: 'm3', prospect: 'Kochi Spice Exports', need: 'Shareholder agreement before a new investor joins', value: 180000, temp: 3, stage: 'passed', days: 0 },
  { id: 'r2', from: 'm9', to: 'm20', prospect: 'Dr. Rohan Mathew', need: 'Home loan for a 3BHK in Edappally', value: 95000, temp: 2, stage: 'passed', days: 1 },
  { id: 'r3', from: 'm5', to: 'm6', prospect: 'Infopark HR team', need: 'Dental camp for 120 staff', value: 140000, temp: 2, stage: 'passed', days: 2 },
  { id: 'r4', from: 'm11', to: 'm12', prospect: 'Grand Hyatt banquets', need: 'Stage florals for a December conclave', value: 320000, temp: 3, stage: 'contacted', days: 3 },
  { id: 'r5', from: 'm1', to: 'm7', prospect: 'Lakeshore Clinic', need: 'Booking site with WhatsApp reminders', value: 210000, temp: 2, stage: 'contacted', days: 4 },
  { id: 'r6', from: 'm4', to: 'm13', prospect: 'Skyline Heights', need: 'Electrical fit-out for 24 villas', value: 1650000, temp: 3, stage: 'meeting', days: 6 },
  { id: 'r7', from: 'm22', to: 'm16', prospect: 'Malabar Cashew Co.', need: 'Monthly containers to Dubai', value: 480000, temp: 1, stage: 'contacted', days: 5 },
  { id: 'r8', from: 'm19', to: 'm29', prospect: 'UST Wellness Club', need: '8-week fitness challenge for 60 people', value: 120000, temp: 2, stage: 'meeting', days: 8 },
  { id: 'r9', from: 'm8', to: 'm1', prospect: 'Periyar Polymers', need: 'Statutory audit and GST review', value: 260000, temp: 3, stage: 'closed', days: 12 },
  { id: 'r10', from: 'm17', to: 'm10', prospect: 'Amrita Ortho Dept.', need: 'Post-surgery rehab partner', value: 90000, temp: 2, stage: 'closed', days: 14 },
  { id: 'r11', from: 'm27', to: 'm2', prospect: 'Casino Hotel', need: 'Lobby and suite redesign', value: 2400000, temp: 3, stage: 'closed', days: 18 },
  { id: 'r12', from: 'm14', to: 'm26', prospect: 'Federal Bank zonal office', need: 'Incentive trip to Bali for 40', value: 1150000, temp: 2, stage: 'meeting', days: 9 },
  { id: 'r13', from: 'm30', to: 'm19', prospect: 'Nexora Labs', need: 'Hire 12 engineers in Q4', value: 300000, temp: 1, stage: 'passed', days: 1 },
  { id: 'r14', from: 'm25', to: 'm4', prospect: 'Mr. Jose K. (Aluva)', need: 'Villa on inherited 30 cents', value: 6500000, temp: 2, stage: 'contacted', days: 7 },
]

export const AGENDA = [
  { time: '07:00', title: 'Open networking', owner: 'All members & visitors', mins: 15 },
  { time: '07:15', title: 'Welcome & opening', owner: 'Arun Karthikeyan · President', mins: 5 },
  { time: '07:20', title: 'Education moment', owner: 'Kavya Nambiar · Education Coordinator', mins: 5 },
  { time: '07:25', title: 'Member 60-second presentations', owner: `${MEMBERS.length} members`, mins: 32, round: true },
  { time: '07:57', title: 'Feature presentation', owner: 'Jyothi Kannan · Bloom Dental Studio', mins: 10 },
  { time: '08:07', title: 'Referrals & TYFCB passing', owner: 'Vivek Nair · Secretary / Treasurer', mins: 13 },
  { time: '08:20', title: 'Visitor introductions', owner: 'Meera Pillai · Visitor Host', mins: 8 },
  { time: '08:28', title: 'Announcements & close', owner: 'Anita Joseph · Vice President', mins: 2 },
]

export const VISITORS = ['Rohit Balan', 'Asha George', 'Mohammed Faiz', 'Sunil Kumar', 'Teresa Paul', 'Gautham Raj', 'Nisha Thampi']

export const FEED: { time: string; text: string; tone: Tone }[] = [
  { time: '09:42', text: 'Anita Joseph passed a referral to Vivek Nair', tone: 'red' },
  { time: '09:10', text: 'Jacob Philip closed ₹24 L with Anita Joseph', tone: 'gold' },
  { time: '08:55', text: 'Visitor Teresa Paul confirmed for Thursday', tone: 'navy' },
  { time: 'Mon', text: 'Ann Maria logged a 1-2-1 with Kavya Nambiar', tone: 'green' },
  { time: 'Mon', text: 'Sanjay Varghese passed a referral to George Kurian', tone: 'red' },
  { time: 'Sun', text: 'Rakhesh R earned 2 CEUs — “Pricing your services”', tone: 'gold' },
]
