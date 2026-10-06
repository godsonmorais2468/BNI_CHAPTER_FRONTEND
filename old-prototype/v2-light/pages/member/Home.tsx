import { Link } from 'react-router-dom'
import { ArrowRight, BookUser, House, UserRound } from 'lucide-react'
import { Icon3D, PageHead } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { firstName } from '../../lib/format'
import { percent } from '../../lib/profile'
import { useDB } from '../../lib/store'

export default function Home() {
  const { member, chapter, region } = useAuth()
  const db = useDB()
  if (!member) return null

  const pct = percent(member)
  const count = db.members.filter((m) => m.chapterId === member.chapterId).length

  return (
    <div className="page">
      <PageHead
        title={`Hi, ${firstName(member.name)}`}
        subtitle={`Welcome to ${chapter?.name ?? 'your chapter'}${region ? `, ${region.name}` : ''}`}
        icon={House}
      />

      {pct < 100 && (
        <section className="banner">
          <Icon3D icon={UserRound} tone="gold" size={52} />
          <div className="banner__text">
            <h2>Your profile is {pct}% complete</h2>
            <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${pct}%` }} />
            </div>
            <p>A complete profile helps other members find and contact you.</p>
          </div>
          <Link className="btn btn--primary" to="/profile">
            Complete profile
          </Link>
        </section>
      )}

      <div className="menu">
        <Link to="/directory" className="menu-tile">
          <Icon3D icon={BookUser} tone="red" size={72} />
          <div>
            <h2>E-Directory</h2>
            <p>
              {count} {count === 1 ? 'member' : 'members'} of {chapter?.name}
            </p>
          </div>
          <ArrowRight size={20} className="menu-tile__go" />
        </Link>
      </div>
    </div>
  )
}
