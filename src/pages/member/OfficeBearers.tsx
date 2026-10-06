import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react'
import { Avatar, Icon3D, PageHead } from '../../components/ui'
import { BEARER_GROUPS } from '../../data/bearers'
import { useAuth } from '../../lib/auth'
import { DESIGNATIONS } from '../../data/seed'
import { useDB } from '../../lib/store'
import type { Member } from '../../lib/types'

/* Within a role, follow the designation order, then A to Z. */
const rank = (m: Member) => {
  const i = DESIGNATIONS.indexOf(m.designation)
  return i === -1 ? DESIGNATIONS.length : i
}
const byDesignation = (a: Member, b: Member) => rank(a) - rank(b) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

export default function OfficeBearers() {
  const { member, chapter } = useAuth()
  const db = useDB()
  const [openKey, setOpenKey] = useState('')

  if (!member) return null
  const mates = db.members.filter((m) => m.chapterId === member.chapterId)
  const total = BEARER_GROUPS.reduce((n, g) => n + mates.filter((m) => g.match(m.designation)).length, 0)

  return (
    <div className="page">
      <PageHead
        eyebrow="Chapter"
        icon={Award}
        tone="gold"
        title="Office Bearers"
        subtitle={`${total} office ${total === 1 ? 'bearer' : 'bearers'} of ${chapter?.name ?? 'your chapter'}. Tap a role for full details.`}
      />

      <div className="acc">
        {BEARER_GROUPS.map((g, i) => {
          const people = mates.filter((m) => g.match(m.designation)).sort(byDesignation)
          const open = openKey === g.key
          return (
            <section className={`acc__item ${open ? 'is-open' : ''}`} key={g.key}>
              <h2>
                <button
                  type="button"
                  className="acc__head"
                  id={`acc-head-${g.key}`}
                  aria-expanded={open}
                  aria-controls={`acc-panel-${g.key}`}
                  onClick={() => setOpenKey(open ? '' : g.key)}
                >
                  <span className="acc__no">{i + 1}</span>
                  <Icon3D icon={g.icon} tone={g.tone} size={52} />
                  <span className="acc__title">
                    <b>{g.title}</b>
                    <small>{people.length ? people.map((m) => m.name).join(', ') : 'Not assigned yet'}</small>
                  </span>
                  <span className={`acc__count ${people.length ? '' : 'is-zero'}`}>{people.length}</span>
                  <ChevronDown className="acc__chev" size={22} aria-hidden />
                </button>
              </h2>

              <div className="acc__panel" id={`acc-panel-${g.key}`} role="region" aria-labelledby={`acc-head-${g.key}`}>
                <div className="acc__inner">
                  {people.length === 0 ? (
                    <p className="acc__empty">No one has been assigned as {g.title} yet.</p>
                  ) : (
                    <ul className="bearers">
                      {people.map((m) => {
                        const digits = m.mobile.replace(/\D/g, '')
                        return (
                          <li className="bcard" key={m.id}>
                            <Link className="bcard__top" to={`/directory/${m.id}`}>
                              <Avatar name={m.name} photo={m.photo} size={64} />
                              <span className="bcard__who">
                                <b>{m.name}</b>
                                <span>{m.organisation || '—'}</span>
                              </span>
                            </Link>
                            <div className="chips">
                              <span className="chip chip--red">{m.designation}</span>
                              {m.category && <span className="chip chip--gold">{m.category}</span>}
                            </div>
                            <dl className="bcard__kv">
                              <div>
                                <dt>Mobile</dt>
                                <dd>{m.mobile}</dd>
                              </div>
                              <div>
                                <dt>Email</dt>
                                <dd>{m.profile.email || '—'}</dd>
                              </div>
                            </dl>
                            <div className="bcard__acts">
                              <a className="qa" href={`tel:+91${digits}`}>
                                <Phone size={15} /> Call
                              </a>
                              <a className="qa" href={`https://wa.me/91${digits}`} target="_blank" rel="noreferrer">
                                <MessageCircle size={15} /> WhatsApp
                              </a>
                              {m.profile.email ? (
                                <a className="qa" href={`mailto:${m.profile.email}`}>
                                  <Mail size={15} /> Email
                                </a>
                              ) : (
                                <span className="qa qa--off" aria-disabled>
                                  <Mail size={15} /> Email
                                </span>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
