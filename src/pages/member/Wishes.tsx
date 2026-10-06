import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cake, ChevronDown, HeartHandshake, MessageCircle, PartyPopper } from 'lucide-react'
import { Avatar, PageHead, Sheet } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { fmtDate, firstName } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { useDB } from '../../lib/store'
import { ordinal, wishesFor } from '../../lib/wishes'
import type { Wish } from '../../lib/wishes'

function whenLabel(w: Wish) {
  if (w.daysAway === 0) return 'Today'
  const day = fmtDate(w.on.toISOString(), { weekday: 'short', day: 'numeric', month: 'short' })
  return `${day} · ${w.daysAway === 1 ? 'tomorrow' : `in ${w.daysAway} days`}`
}

function WishCard({ wish, mine }: { wish: Wish; mine: boolean }) {
  const { member: m, kind } = wish
  const digits = m.mobile.replace(/\D/g, '')
  const first = firstName(m.name)
  const text =
    kind === 'birthday'
      ? `Happy Birthday, ${first}! Wishing you a wonderful year ahead.`
      : `Happy Anniversary, ${first}${m.profile.spouse ? ` and ${m.profile.spouse}` : ''}! Wishing you many more happy years together.`

  return (
    <li className={`bcard wcard ${wish.daysAway === 0 ? 'is-today' : ''}`}>
      <Link className="bcard__top" to={`/directory/${m.id}`}>
        <Avatar name={m.name} photo={m.photo} size={60} />
        <span className="bcard__who">
          <b>{m.name}</b>
          <span>{m.organisation || '—'}</span>
        </span>
      </Link>
      <div className="chips">
        <span className={`chip ${wish.daysAway === 0 ? 'chip--red' : ''}`}>{whenLabel(wish)}</span>
        {wish.years > 0 && <span className="chip chip--gold">{kind === 'birthday' ? `Turns ${wish.years}` : `${ordinal(wish.years)} anniversary`}</span>}
        {kind === 'anniversary' && m.profile.spouse && <span className="chip">With {m.profile.spouse}</span>}
      </div>
      {wish.daysAway === 0 &&
        (mine ? (
          <p className="wcard__me">That is your day. Your chapter is wishing you well.</p>
        ) : (
          <div className="bcard__acts">
            <a className="qa" href={`https://wa.me/91${digits}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
              <MessageCircle size={15} /> Send wishes
            </a>
          </div>
        ))}
    </li>
  )
}

function Group({ wishes, meId }: { wishes: Wish[]; meId: string }) {
  return (
    <ul className="wgrid">
      {wishes.map((w) => (
        <WishCard key={`${w.kind}-${w.member.id}`} wish={w} mine={w.member.id === meId} />
      ))}
    </ul>
  )
}

export default function Wishes() {
  const { member, chapter } = useAuth()
  const db = useDB()
  const now = useNow(60_000)
  const [more, setMore] = useState(false)

  if (!member) return null

  const all = wishesFor(db.members.filter((m) => m.chapterId === member.chapterId), now)
  const today = all.filter((w) => w.daysAway === 0)
  const upcoming = all.filter((w) => w.daysAway > 0)
  const todayBdays = today.filter((w) => w.kind === 'birthday')
  const todayAnns = today.filter((w) => w.kind === 'anniversary')
  const upBdays = upcoming.filter((w) => w.kind === 'birthday')
  const upAnns = upcoming.filter((w) => w.kind === 'anniversary')

  return (
    <div className="page">
      <PageHead
        eyebrow={chapter?.name ?? 'Chapter'}
        icon={PartyPopper}
        tone="gold"
        title="Wishes"
        subtitle={fmtDate(new Date(now).toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      />

      <div className="att">
        <Sheet icon={Cake} tone="gold" title="Birthdays today" note={todayBdays.length ? `${todayBdays.length} in your chapter` : undefined}>
          {todayBdays.length ? <Group wishes={todayBdays} meId={member.id} /> : <p className="acc__empty wempty">No birthdays today.</p>}
        </Sheet>

        <Sheet icon={HeartHandshake} tone="wine" title="Anniversaries today" note={todayAnns.length ? `${todayAnns.length} in your chapter` : undefined}>
          {todayAnns.length ? <Group wishes={todayAnns} meId={member.id} /> : <p className="acc__empty wempty">No anniversaries today.</p>}
        </Sheet>

        {upcoming.length > 0 && (
          <button type="button" className="btn btn--line more" aria-expanded={more} onClick={() => setMore((o) => !o)}>
            {more ? 'Show less' : `View more · ${upcoming.length} upcoming`}
            <ChevronDown size={17} className={more ? 'is-up' : ''} />
          </button>
        )}

        {more && upBdays.length > 0 && (
          <Sheet icon={Cake} tone="gold" title="Upcoming birthdays" note="Next 30 days">
            <Group wishes={upBdays} meId={member.id} />
          </Sheet>
        )}
        {more && upAnns.length > 0 && (
          <Sheet icon={HeartHandshake} tone="wine" title="Upcoming anniversaries" note="Next 30 days">
            <Group wishes={upAnns} meId={member.id} />
          </Sheet>
        )}
      </div>
    </div>
  )
}
