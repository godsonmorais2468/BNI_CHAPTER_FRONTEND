import { Link } from 'react-router-dom'
import {
  Armchair,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Clock,
  Handshake,
  IndianRupee,
  LayoutGrid,
  MapPin,
  Radio,
  Send,
  Trophy,
  UserPlus,
} from 'lucide-react'
import { Avatar, Icon3D, PageHead, Spark } from '../components/ui'
import {
  CHAPTER,
  FEED,
  MEMBERS,
  NEXT_MEETING,
  OPEN_CATEGORIES,
  TEAMS,
  TODAY,
  VISITORS,
  WEEK,
  WEEKLY,
} from '../data/mock'
import type { Team, Tone } from '../data/mock'
import { useAuth } from '../lib/auth'
import { useNow } from '../lib/hooks'
import { firstName, fmtDate, initials, inrCompact, isoWeek } from '../lib/format'

const TARGET = 95
const CHART_FLOOR = 80

/* Bars start at 80% so small swings stay visible; the top 18% of the plot is left for the value labels. */
function barHeight(pct: number) {
  return ((pct - CHART_FLOOR) / (100 - CHART_FLOOR)) * 82
}

function pctChange(series: number[]) {
  const [prev, cur] = series.slice(-2)
  return Math.round(((cur - prev) / prev) * 100)
}

const KPIS: { label: string; icon: typeof Send; tone: Tone; series: number[]; fmt: (v: number) => string }[] = [
  { label: 'Referrals passed', icon: Send, tone: 'red', series: WEEKLY.map((w) => w.referrals), fmt: String },
  { label: 'TYFCB this week', icon: IndianRupee, tone: 'gold', series: WEEKLY.map((w) => w.tyfcb), fmt: inrCompact },
  { label: 'Visitors', icon: UserPlus, tone: 'navy', series: WEEKLY.map((w) => w.visitors), fmt: String },
  { label: 'One-to-ones', icon: Handshake, tone: 'green', series: WEEKLY.map((w) => w.oneToOnes), fmt: String },
]

const RENEWALS = MEMBERS.map((m) => ({ m, days: Math.ceil((m.renewal.getTime() - TODAY.getTime()) / 864e5) }))
  .filter((r) => r.days <= 45)
  .sort((a, b) => a.days - b.days)
  .slice(0, 4)

const TOP_GIVERS = [...MEMBERS].sort((a, b) => b.given - a.given).slice(0, 5)

const TEAM_ORDER = Object.keys(TEAMS) as Team[]
const SEATS: { key: string; tone: Tone | null; title: string }[] = [
  ...TEAM_ORDER.flatMap((t) =>
    MEMBERS.filter((m) => m.team === t).map((m) => ({ key: m.id, tone: TEAMS[t].tone, title: `${m.category} — ${m.name}` })),
  ),
  ...OPEN_CATEGORIES.map((c) => ({ key: c, tone: null, title: `Open: ${c}` })),
]

export default function Overview() {
  const { user } = useAuth()
  const now = useNow(1000)
  const left = Math.max(0, NEXT_MEETING.getTime() - now.getTime())
  const parts: [string, number][] = [
    ['Days', Math.floor(left / 864e5)],
    ['Hours', Math.floor(left / 36e5) % 24],
    ['Min', Math.floor(left / 6e4) % 60],
    ['Sec', Math.floor(left / 1e3) % 60],
  ]
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const thisWeek = WEEKLY[WEEKLY.length - 1]
  const termAvg = Math.round(WEEKLY.reduce((s, w) => s + w.attendance, 0) / WEEKLY.length)
  const maxGiven = TOP_GIVERS[0].given

  return (
    <div className="page">
      <PageHead
        icon={LayoutGrid}
        kicker={`Chapter pulse · Week ${isoWeek(TODAY)}`}
        title={
          <>
            {greeting}, <em>{firstName(user?.name ?? 'there')}.</em>
          </>
        }
        lede={`${CHAPTER.name} passed ${thisWeek.referrals} referrals last week — the best run this term. ${RENEWALS.length} renewals need a nudge and ${VISITORS.length} visitors are confirmed for Thursday.`}
        actions={
          <>
            <Link className="btn btn--line" to="/attendance">
              Mark attendance
            </Link>
            <Link className="btn btn--primary" to="/referrals?new=1">
              <Send size={16} /> Log a referral
            </Link>
          </>
        }
      />

      <div className="ov-top">
        <section className="hero">
          <span className="hero__ring" aria-hidden />
          <span className="hero__wm" aria-hidden>
            {WEEK}
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Icon3D icon={CalendarClock} tone="gold" size={52} />
            <div>
              <div className="hero__kicker">Next weekly meeting · Week {WEEK}</div>
              <h2 className="hero__title">
                {fmtDate(NEXT_MEETING, { weekday: 'long' })}, <em>{fmtDate(NEXT_MEETING, { day: 'numeric', month: 'long' })}</em>
              </h2>
              <p className="hero__meta">
                <span>
                  <Clock size={15} /> 07:00 – 08:30
                </span>
                <span>
                  <MapPin size={15} /> {CHAPTER.venue}
                </span>
              </p>
            </div>
          </div>

          <div className="count" role="timer" aria-label="Time until the meeting">
            {parts.map(([unit, n]) => (
              <div className="count__cell" key={unit}>
                <div className="count__n">{String(n).padStart(2, '0')}</div>
                <div className="count__u">{unit}</div>
              </div>
            ))}
          </div>

          <div className="hero__foot">
            <div className="stack">
              <span className="stack__faces">
                {VISITORS.slice(0, 5).map((v) => (
                  <span key={v} title={v}>
                    {initials(v)}
                  </span>
                ))}
              </span>
              {VISITORS.length} visitors confirmed
            </div>
            <Link to="/meeting" className="btn btn--light">
              Open run of show <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <div className="kpis">
          {KPIS.map((k) => {
            const change = pctChange(k.series)
            const up = change >= 0
            return (
              <div className="kpi" key={k.label}>
                <div className="kpi__top">
                  <Icon3D icon={k.icon} tone={k.tone} size={46} />
                  <Spark data={k.series} />
                </div>
                <div className="kpi__label">{k.label}</div>
                <div className="kpi__value">{k.fmt(k.series[k.series.length - 1])}</div>
                <div className="kpi__foot">
                  <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}>
                    {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(change)}%<small>vs last wk</small>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="ov-mid">
        <section className="card">
          <div className="card__head">
            <h3 className="card__title">
              <Icon3D icon={BarChart3} tone="navy" size={36} /> Attendance, last 12 weeks
            </h3>
            <span className="card__meta">
              <span style={{ color: 'var(--gold-ink)' }}>- - {TARGET}% target</span>
            </span>
          </div>
          <div className="chart">
            <div className="chart__plot">
              <div className="chart__target" style={{ bottom: `${barHeight(TARGET)}%` }} />
              {WEEKLY.map((w, i) => (
                <div key={w.label} className={`chart__col ${i === WEEKLY.length - 1 ? 'is-now' : ''}`} title={`${w.label}: ${w.attendance}%`}>
                  <span className="chart__val">{w.attendance}</span>
                  <div className="chart__bar" style={{ height: `${barHeight(w.attendance)}%` }} />
                </div>
              ))}
            </div>
            <div className="chart__labels">
              {WEEKLY.map((w) => (
                <span key={w.label}>{w.label}</span>
              ))}
            </div>
          </div>
          <div className="chart__summary">
            <div>
              <b>{termAvg}%</b>
              <span>Term average</span>
            </div>
            <div>
              <b>{Math.max(...WEEKLY.map((w) => w.attendance))}%</b>
              <span>Best week</span>
            </div>
            <div>
              <b>{WEEKLY.filter((w) => w.attendance >= TARGET).length}/12</b>
              <span>On target</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card__head">
            <h3 className="card__title">
              <Icon3D icon={Armchair} tone="wine" size={36} /> Category seats
            </h3>
            <span className="card__meta">
              {MEMBERS.length} of {CHAPTER.seats} filled
            </span>
          </div>
          <div className="seats">
            {SEATS.map((s) => (
              <span key={s.key} className={s.tone ? `seat t-${s.tone}` : 'seat seat--open'} title={s.title} />
            ))}
          </div>
          <div className="legend">
            {TEAM_ORDER.map((t) => (
              <span key={t}>
                <i className={`chip__sw t-${TEAMS[t].tone}`} />
                {TEAMS[t].label}
              </span>
            ))}
          </div>
          <div className="open-cats">
            <div className="card__meta">Open categories — invite a visitor</div>
            <div className="open-cats__list">
              {OPEN_CATEGORIES.map((c) => (
                <span key={c} className="tag tag--line">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="ov-bot">
        <section className="card">
          <div className="card__head">
            <h3 className="card__title">
              <Icon3D icon={Trophy} tone="gold" size={36} /> Top givers
            </h3>
            <span className="card__meta">This term</span>
          </div>
          <ol>
            {TOP_GIVERS.map((m, i) => (
              <li key={m.id} className="rank">
                <span className="rank__n">{i + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="rank__name">{m.name}</div>
                  <div className="rank__bar">
                    <i style={{ width: `${(m.given / maxGiven) * 100}%` }} />
                  </div>
                </div>
                <span className="rank__v">{m.given}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card">
          <div className="card__head">
            <h3 className="card__title">
              <Icon3D icon={CalendarClock} tone="red" size={36} /> Renewals due
            </h3>
            <Link className="card__link" to="/members">
              Roster <ArrowRight size={14} />
            </Link>
          </div>
          {RENEWALS.map(({ m, days }) => (
            <Link key={m.id} to={`/members?m=${m.id}`} className="renew">
              <Avatar name={m.name} tone={TEAMS[m.team].tone} size={40} />
              <div className="renew__main">
                <div className="who__name">{m.name}</div>
                <div className="who__sub">{m.category}</div>
              </div>
              <div className="renew__date" style={{ color: days < 0 ? 'var(--red)' : days <= 14 ? 'var(--gold-ink)' : 'var(--ink-soft)' }}>
                <b>{Math.abs(days)}</b>
                {days < 0 ? 'days late' : 'days left'}
              </div>
            </Link>
          ))}
        </section>

        <section className="card">
          <div className="card__head">
            <h3 className="card__title">
              <Icon3D icon={Radio} tone="steel" size={36} /> Chapter wire
            </h3>
            <span className="card__meta">Live</span>
          </div>
          <ul className="feed">
            {FEED.map((f, i) => (
              <li key={i}>
                <time>{f.time}</time>
                <span className={`feed__pin t-${f.tone}`} />
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
