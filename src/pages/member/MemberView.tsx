import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import { Avatar, Icon3D } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { fmtDate } from '../../lib/format'
import { useDB } from '../../lib/store'

const withScheme = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)
const LONG = { day: 'numeric', month: 'long', year: 'numeric' } as const

export default function MemberView() {
  const { id } = useParams()
  const { member: me } = useAuth()
  const db = useDB()

  const m = db.members.find((x) => x.id === id && x.chapterId === me?.chapterId)
  if (!m) {
    return (
      <div className="page">
        <Link className="btn btn--line btn--sm back" to="/directory">
          <ArrowLeft size={15} /> E-Directory
        </Link>
        <div className="empty">
          <b>Member not found.</b>
          They may belong to a different chapter.
        </div>
      </div>
    )
  }

  const chapter = db.chapters.find((c) => c.id === m.chapterId)
  const region = db.regions.find((r) => r.id === m.regionId)
  const p = m.profile
  const digits = m.mobile.replace(/\D/g, '')

  const rows: [string, ReactNode][] = [
    ['Name', m.name],
    ['Company name', m.organisation || '—'],
    ['Designation', m.designation],
    ['Category', m.category || '—'],
    ['Mobile no', m.mobile],
    ['Email', p.email || '—'],
    ['Website', p.website ? <a href={withScheme(p.website)} target="_blank" rel="noreferrer">{p.website}</a> : '—'],
    ['Social media', p.social ? <a href={withScheme(p.social)} target="_blank" rel="noreferrer">{p.social}</a> : '—'],
    ['Birthday', p.dob ? fmtDate(p.dob, LONG) : '—'],
    ['Married', p.married === 'yes' ? 'Yes' : p.married === 'no' ? 'No' : '—'],
  ]
  if (p.married === 'yes') {
    rows.push(['Spouse name', p.spouse || '—'], ['Anniversary', p.anniversary ? fmtDate(p.anniversary, LONG) : '—'])
  }
  rows.push(['Chapter', chapter?.name ?? '—'], ['Region', region?.name ?? '—'], ['Member since', fmtDate(m.createdAt, { month: 'long', year: 'numeric' })])

  return (
    <div className="page">
      <Link className="btn btn--line btn--sm back" to="/directory">
        <ArrowLeft size={15} /> E-Directory
      </Link>

      <div className="mv">
        <section className="cover">
          <div className="cover__art" />
          <div className="cover__head">
            <Avatar name={m.name} photo={m.photo} size={112} />
            <div className="cover__who">
              <h1>{m.name}</h1>
              <p>
                {m.designation}
                {m.organisation && ` · ${m.organisation}`}
              </p>
            </div>
          </div>
          {m.category && (
            <div className="cover__chips chips">
              <span className="chip chip--gold">{m.category}</span>
              {chapter && <span className="chip">{chapter.name}</span>}
            </div>
          )}
          <dl className="kv">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="mv__side" aria-label="Contact">
          <a className="act" href={`tel:+91${digits}`}>
            <Icon3D icon={Phone} tone="green" size={48} />
            <span>
              <b>Call</b>
              <small>{m.mobile}</small>
            </span>
          </a>
          <a className="act" href={`https://wa.me/91${digits}`} target="_blank" rel="noreferrer">
            <Icon3D icon={MessageCircle} tone="green" size={48} />
            <span>
              <b>WhatsApp</b>
              <small>Send a message</small>
            </span>
          </a>
          {p.email ? (
            <a className="act" href={`mailto:${p.email}`}>
              <Icon3D icon={Mail} tone="wine" size={48} />
              <span>
                <b>Email</b>
                <small>{p.email}</small>
              </span>
            </a>
          ) : (
            <div className="act act--off" aria-disabled>
              <Icon3D icon={Mail} tone="steel" size={48} />
              <span>
                <b>Email</b>
                <small>No email added</small>
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
