import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, LayoutGrid, List, Mail, Phone, Search, Send, UserPlus, Users } from 'lucide-react'
import { Avatar, Drawer, Icon3D, PageHead } from '../components/ui'
import { CHAPTER, MEETING_DATES, MEMBERS, TEAMS, TODAY } from '../data/mock'
import type { Member, Palms, Team } from '../data/mock'
import { fmtDate, inrCompact } from '../lib/format'
import { useToast } from '../lib/toast'

const PALMS_COLOR: Record<Palms, string> = {
  P: 'var(--green)',
  A: 'var(--red)',
  L: 'var(--gold)',
  M: 'var(--ink-mute)',
  S: 'var(--line-mid)',
}

function renewalDays(m: Member) {
  return Math.ceil((m.renewal.getTime() - TODAY.getTime()) / 864e5)
}

function RenewalTag({ m }: { m: Member }) {
  const days = renewalDays(m)
  if (days < 0) return <span className="tag tag--red">Renewal overdue</span>
  if (days <= 45) return <span className="tag tag--gold">Renews in {days}d</span>
  return null
}

export default function Members() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [team, setTeam] = useState<Team | 'All'>('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const toast = useToast()

  const needle = q.trim().toLowerCase()
  const list = MEMBERS.filter(
    (m) =>
      (team === 'All' || m.team === team) &&
      (!needle || [m.name, m.business, m.category].some((s) => s.toLowerCase().includes(needle))),
  )
  const open = MEMBERS.find((m) => m.id === params.get('m')) ?? null
  const teams = Object.keys(TEAMS) as Team[]

  return (
    <div className="page">
      <PageHead
        icon={Users}
        kicker={`Roster · ${MEMBERS.length} of ${CHAPTER.seats} seats`}
        title={
          <>
            The <em>members.</em>
          </>
        }
        lede="One professional per category. Tap anyone to see their weekly ask, numbers and PALMS record."
        actions={
          <button className="btn btn--primary" onClick={() => toast('Invite link copied for a new member', 'ok')}>
            <UserPlus size={16} /> Invite member
          </button>
        }
      />

      <div className="toolbar">
        <label className="searchbox">
          <Search size={16} />
          <span className="sr-only">Search members</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, business or category" />
        </label>
        <span className="toolbar__spacer" />
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={view === 'grid'} onClick={() => setView('grid')} aria-label="Grid view">
            <LayoutGrid size={16} />
          </button>
          <button aria-pressed={view === 'list'} onClick={() => setView('list')} aria-label="List view">
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Power team">
        <button className="chip" aria-pressed={team === 'All'} onClick={() => setTeam('All')}>
          All <span className="chip__n">{MEMBERS.length}</span>
        </button>
        {teams.map((t) => (
          <button key={t} className="chip" aria-pressed={team === t} onClick={() => setTeam(t)}>
            <span className={`chip__sw t-${TEAMS[t].tone}`} />
            {TEAMS[t].label}
            <span className="chip__n">{MEMBERS.filter((m) => m.team === t).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <b>No one matches.</b>
          Try a different name, or clear the power-team filter.
        </div>
      ) : view === 'grid' ? (
        <div className="mgrid">
          {list.map((m) => (
            <button key={m.id} className="mcard" onClick={() => setParams({ m: m.id })}>
              <div className="mcard__top">
                <Avatar name={m.name} tone={TEAMS[m.team].tone} size={48} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  {m.role && <span className="tag tag--ink">{m.role}</span>}
                  <RenewalTag m={m} />
                </div>
              </div>
              <div>
                <h3 className="mcard__name">{m.name}</h3>
                <div className="mcard__biz">{m.business}</div>
                <div className="mcard__cat">{m.category}</div>
              </div>
              <div className="palms-strip" title="Last 8 meetings">
                {m.palms.map((p, i) => (
                  <i key={i} style={{ background: PALMS_COLOR[p] }} />
                ))}
              </div>
              <div className="mcard__stats">
                <div className="mini">
                  <b>{m.given}</b>
                  <span>Given</span>
                </div>
                <div className="mini">
                  <b>{m.received}</b>
                  <span>Received</span>
                </div>
                <div className="mini">
                  <b>{m.oneToOnes}</b>
                  <span>1-2-1s</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Category</th>
                <th>Power team</th>
                <th className="r">Given</th>
                <th className="r">Received</th>
                <th className="r">TYFCB</th>
                <th>Renewal</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="is-click" onClick={() => setParams({ m: m.id })}>
                  <td>
                    <div className="who">
                      <Avatar name={m.name} tone={TEAMS[m.team].tone} size={34} />
                      <div>
                        <div className="who__name">{m.name}</div>
                        <div className="who__sub">{m.business}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.category}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                      <span className={`chip__sw t-${TEAMS[m.team].tone}`} />
                      {TEAMS[m.team].label}
                    </span>
                  </td>
                  <td className="num">{m.given}</td>
                  <td className="num">{m.received}</td>
                  <td className="num">{inrCompact(m.tyfcb)}</td>
                  <td>
                    <RenewalTag m={m} /> {renewalDays(m) > 45 && <span className="mono">{fmtDate(m.renewal, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <Profile m={open} onClose={() => setParams({})} />}
    </div>
  )
}

function Profile({ m, onClose }: { m: Member; onClose: () => void }) {
  const toast = useToast()
  const navigate = useNavigate()
  const present = m.palms.filter((p) => p === 'P' || p === 'L' || p === 'S').length

  return (
    <Drawer title={`Member since ${m.since}`} onClose={onClose}>
      <div className="profile__top">
        <Avatar name={m.name} tone={TEAMS[m.team].tone} size={72} />
        <div style={{ minWidth: 0 }}>
          <h2 className="profile__name">{m.name}</h2>
          <div className="profile__biz">{m.business}</div>
          <div className="profile__tags">
            <span className="tag tag--line">{m.category}</span>
            <span className={`tag tag--tone t-${TEAMS[m.team].tone}`}>
              {TEAMS[m.team].label}
            </span>
            {m.role && <span className="tag tag--ink">{m.role}</span>}
            <RenewalTag m={m} />
          </div>
        </div>
      </div>

      <blockquote className="ask">
        <small>This week’s ask</small>“{m.ask}.”
      </blockquote>

      <div className="statgrid">
        <div>
          <b>{m.given}</b>
          <span>Refs given</span>
        </div>
        <div>
          <b>{m.received}</b>
          <span>Refs received</span>
        </div>
        <div>
          <b>{inrCompact(m.tyfcb)}</b>
          <span>TYFCB</span>
        </div>
        <div>
          <b>{m.oneToOnes}</b>
          <span>1-2-1s</span>
        </div>
        <div>
          <b>{m.ceu}</b>
          <span>CEUs</span>
        </div>
        <div>
          <b>{m.visitors}</b>
          <span>Visitors</span>
        </div>
      </div>

      <div className="section-label">
        PALMS · {present}/8 attended
      </div>
      <div className="palms-row">
        {m.palms.map((p, i) => (
          <div key={i}>
            <span className={`pcell pcell--${p}`} style={{ display: 'grid', placeItems: 'center', width: '100%' }}>
              {p}
            </span>
            <small>{fmtDate(MEETING_DATES[i], { day: 'numeric', month: 'short' })}</small>
          </div>
        ))}
      </div>

      <div className="section-label">Contact</div>
      <div className="contact">
        <a href={`tel:${m.phone.replace(/\s/g, '')}`}>
          <Icon3D icon={Phone} tone="green" size={34} /> <span className="mono">{m.phone}</span>
        </a>
        <a href={`mailto:${m.email}`}>
          <Icon3D icon={Mail} tone="navy" size={34} /> {m.email}
        </a>
      </div>

      <div className="drawer__actions">
        <button className="btn btn--line" onClick={() => toast(`1-2-1 request sent to ${m.name.split(' ')[0]}`)}>
          <CalendarPlus size={16} /> Book 1-2-1
        </button>
        <button className="btn btn--primary" onClick={() => navigate(`/referrals?new=1&to=${m.id}`)}>
          <Send size={16} /> Pass referral
        </button>
      </div>
    </Drawer>
  )
}
