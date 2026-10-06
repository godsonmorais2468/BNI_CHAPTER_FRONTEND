import { Link } from 'react-router-dom'
import { ArrowRight, Award, BookUser, CalendarCheck, IndianRupee, Landmark, ListChecks, Map, PartyPopper, Sparkles } from 'lucide-react'
import { Avatar, Icon3D } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { currentMeeting, phaseOf } from '../../lib/attendance'
import { totalOf } from '../../lib/dues'
import { fmtDate, fmtTime, firstName, inr } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { useDB } from '../../lib/store'
import type { Attendance, Meeting } from '../../lib/types'
import { wishesFor } from '../../lib/wishes'
import { BEARER_GROUPS } from '../../data/bearers'

/** The one-line attendance status shown on the dashboard. */
function attendanceStatus(meeting: Meeting | undefined, mark: Attendance | undefined, now: number) {
  if (!meeting) return { text: 'No meetings scheduled yet.', label: 'No meeting', tone: 'idle' }
  const phase = phaseOf(meeting, now)
  if (mark) return { text: `${meeting.title} · marked present at ${fmtTime(mark.at)}`, label: 'Marked', tone: 'ok' }
  if (phase === 'open') return { text: `${meeting.title} is open. Mark your attendance now.`, label: 'Not marked', tone: 'bad' }
  if (phase === 'upcoming') {
    return { text: `${meeting.title} on ${fmtDate(meeting.startsAt, { weekday: 'short', day: 'numeric', month: 'short' })}, ${fmtTime(meeting.startsAt)}`, label: 'Upcoming', tone: 'idle' }
  }
  return { text: `You did not mark attendance for ${meeting.title}.`, label: 'Not marked', tone: 'bad' }
}

export default function Home() {
  const { member, chapter, region } = useAuth()
  const db = useDB()
  const now = useNow(30_000)
  if (!member) return null

  const mates = db.members.filter((m) => m.chapterId === member.chapterId)
  const meeting = currentMeeting(db.meetings.filter((m) => m.chapterId === member.chapterId), now)
  const att = attendanceStatus(meeting, meeting ? db.attendance.find((a) => a.meetingId === meeting.id && a.memberId === member.id) : undefined, now)
  const todays = wishesFor(mates, now).filter((w) => w.daysAway === 0)
  const nBirthdays = todays.filter((w) => w.kind === 'birthday').length
  const nAnniversaries = todays.length - nBirthdays
  const wishText = todays.length
    ? [nBirthdays && `${nBirthdays} ${nBirthdays === 1 ? 'birthday' : 'birthdays'}`, nAnniversaries && `${nAnniversaries} ${nAnniversaries === 1 ? 'anniversary' : 'anniversaries'}`].filter(Boolean).join(' and ') + ' today'
    : 'No birthdays or anniversaries today.'
  const pending = db.invoices.filter((i) => i.memberId === member.id && i.status === 'due')
  const waiting = db.polls.filter((p) => p.chapterId === member.chapterId && !p.closed && !db.votes.some((v) => v.pollId === p.id && v.memberId === member.id))
  const bearers = mates.filter((m) => BEARER_GROUPS.some((g) => g.match(m.designation)))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page">
      <div className="bento">
        <section className="b-hero">
          <div>
            <Icon3D icon={Sparkles} tone="gold" size={52} />
            <h1 style={{ marginTop: 20 }}>
              {greeting},<br />
              {firstName(member.name)}
            </h1>
            <p>Welcome back to your chapter.</p>
          </div>
          <div className="chips">
            <span className="chip chip--gold">{member.designation}</span>
            {chapter && (
              <span className="chip">
                <Landmark size={13} /> {chapter.name}
              </span>
            )}
            {region && (
              <span className="chip">
                <Map size={13} /> {region.name}
              </span>
            )}
          </div>
        </section>

        <Link to="/directory" className="b-dir">
          <div className="b-dir__top">
            <Icon3D icon={BookUser} tone="red" size={72} />
            <span className="b-dir__go">
              <ArrowRight size={20} />
            </span>
          </div>
          <div>
            <div className="faces">
              {mates.slice(0, 6).map((m) => (
                <Avatar key={m.id} name={m.name} photo={m.photo} size={40} />
              ))}
              {mates.length > 6 && <span className="faces__more">+{mates.length - 6}</span>}
            </div>
            <h2>E-Directory</h2>
            <p>
              {mates.length} {mates.length === 1 ? 'member' : 'members'} of {chapter?.name}
            </p>
          </div>
        </Link>

        <Link to="/attendance" className="b-dir b-dir--wide">
          <Icon3D icon={CalendarCheck} tone="green" size={72} />
          <div className="b-dir__txt">
            <h2>Attendance</h2>
            <p>{att.text}</p>
          </div>
          <span className={`stat stat--lg stat--${att.tone}`}>{att.label}</span>
          <span className="b-dir__go">
            <ArrowRight size={20} />
          </span>
        </Link>

        <Link to="/rsvp" className="b-dir b-dir--wide">
          <Icon3D icon={ListChecks} tone="green" size={72} />
          <div className="b-dir__txt">
            <h2>RSVP</h2>
            <p>{waiting.length ? `${waiting.length} ${waiting.length === 1 ? 'poll is' : 'polls are'} waiting for your response.` : 'No polls waiting for you.'}</p>
          </div>
          <span className={`stat stat--lg ${waiting.length ? 'stat--bad' : 'stat--ok'}`}>{waiting.length ? `${waiting.length} to answer` : 'All answered'}</span>
          <span className="b-dir__go">
            <ArrowRight size={20} />
          </span>
        </Link>

        <Link to="/dues" className="b-dir b-dir--wide">
          <Icon3D icon={IndianRupee} tone="gold" size={72} />
          <div className="b-dir__txt">
            <h2>Dues</h2>
            <p>{pending.length ? `${inr(totalOf(pending))} to pay across ${pending.length} ${pending.length === 1 ? 'invoice' : 'invoices'}` : 'You have no pending dues.'}</p>
          </div>
          <span className={`stat stat--lg ${pending.length ? 'stat--bad' : 'stat--ok'}`}>{pending.length ? `${pending.length} pending` : 'All paid'}</span>
          <span className="b-dir__go">
            <ArrowRight size={20} />
          </span>
        </Link>

        <Link to="/wishes" className="b-dir b-dir--wide">
          <Icon3D icon={PartyPopper} tone="navy" size={72} />
          <div className="b-dir__txt">
            <h2>Wishes</h2>
            <p>{wishText}</p>
          </div>
          <span className="b-dir__go">
            <ArrowRight size={20} />
          </span>
        </Link>

        <Link to="/office-bearers" className="b-dir b-dir--wide">
          <Icon3D icon={Award} tone="gold" size={72} />
          <div className="b-dir__txt">
            <h2>Office Bearers</h2>
            <p>President, Vice President, Secretary / Treasurer, Ambassadors, Launch Team and Coordinators</p>
          </div>
          <div className="faces">
            {bearers.slice(0, 5).map((m) => (
              <Avatar key={m.id} name={m.name} photo={m.photo} size={40} />
            ))}
            {bearers.length > 5 && <span className="faces__more">+{bearers.length - 5}</span>}
          </div>
          <span className="b-dir__go">
            <ArrowRight size={20} />
          </span>
        </Link>
      </div>
    </div>
  )
}
