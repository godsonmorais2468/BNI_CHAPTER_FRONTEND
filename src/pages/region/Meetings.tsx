import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarClock, CalendarPlus, LocateFixed, MapPin, Trash2, Users, Video } from 'lucide-react'
import { Field, FieldGroup, Icon3D, PageHead, Sheet, StatStrip } from '../../components/ui'
import { phaseOf } from '../../lib/attendance'
import { useAuth } from '../../lib/auth'
import { fmtDate, fmtTime } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { createMeeting, deleteMeeting, useDB } from '../../lib/store'
import { useToast } from '../../lib/toast'
import type { MeetingMode } from '../../lib/types'

/** Half an hour from now, as the values a date and a time input expect. */
function soon() {
  const d = new Date(new Date().getTime() + 30 * 60_000)
  return { date: d.toLocaleDateString('en-CA'), time: d.toTimeString().slice(0, 5) }
}

const inRange = (v: number, lo: number, hi: number) => Number.isFinite(v) && v >= lo && v <= hi

export default function Meetings() {
  const { region } = useAuth()
  const db = useDB()
  const toast = useToast()
  const now = useNow(30_000)

  const [chapterId, setChapterId] = useState('')
  const [title, setTitle] = useState('Weekly meeting')
  const [mode, setMode] = useState<MeetingMode>('offline')
  const [when, setWhen] = useState(soon)
  const [duration, setDuration] = useState('90')
  const [venue, setVenue] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [radius, setRadius] = useState('100')
  const [locating, setLocating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!region) return null
  const chapters = db.chapters.filter((c) => c.regionId === region.id)
  const meetings = db.meetings
    .filter((m) => m.regionId === region.id)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

  function fillFromGps() {
    if (!('geolocation' in navigator)) return setErrors((e) => ({ ...e, lat: 'This browser cannot share its location.' }))
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude.toFixed(6))
        setLng(p.coords.longitude.toFixed(6))
        setLocating(false)
        setErrors((e) => ({ ...e, lat: '', lng: '' }))
      },
      () => {
        setLocating(false)
        setErrors((e) => ({ ...e, lat: 'Could not get your location. Type the coordinates instead.' }))
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!region) return
    const next: Record<string, string> = {}
    const mins = Number(duration)
    if (!chapterId) next.chapterId = 'Select a chapter.'
    if (!title.trim()) next.title = 'Enter a meeting title.'
    if (!when.date || !when.time) next.when = 'Pick the date and start time.'
    if (!inRange(mins, 15, 600)) next.duration = 'Enter a duration between 15 and 600 minutes.'
    if (mode === 'offline') {
      if (!venue.trim()) next.venue = 'Enter the venue name.'
      if (!inRange(Number(lat), -90, 90) || !lat.trim()) next.lat = 'Enter a latitude between -90 and 90.'
      if (!inRange(Number(lng), -180, 180) || !lng.trim()) next.lng = 'Enter a longitude between -180 and 180.'
      if (!inRange(Number(radius), 10, 5000)) next.radius = 'Enter a radius between 10 and 5000 metres.'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    createMeeting({
      regionId: region.id,
      chapterId,
      title,
      mode,
      startsAt: new Date(`${when.date}T${when.time}`).toISOString(),
      durationMin: mins,
      venue: mode === 'offline' ? venue : '',
      lat: mode === 'offline' ? Number(lat) : null,
      lng: mode === 'offline' ? Number(lng) : null,
      radiusM: mode === 'offline' ? Number(radius) : 100,
    })
    toast('Meeting created')
    setWhen(soon())
  }

  const upcoming = meetings.filter((m) => phaseOf(m, now) !== 'ended').length

  return (
    <div className="page">
      <PageHead
        eyebrow={`Region Admin · ${region.name}`}
        icon={CalendarClock}
        tone="gold"
        title="Meetings"
        subtitle="Schedule chapter meetings. For offline meetings, set the venue location and how close members must be to mark attendance."
      />

      <StatStrip
        items={[
          { icon: CalendarClock, tone: 'gold', label: 'Meetings', value: meetings.length },
          { icon: CalendarPlus, tone: 'red', label: 'Open or upcoming', value: upcoming },
          { icon: Users, tone: 'green', label: 'Attendance marked', value: db.attendance.filter((a) => meetings.some((m) => m.id === a.meetingId)).length },
        ]}
      />

      <div className="duo">
        <Sheet icon={CalendarPlus} tone="gold" title="Create meeting" note={region.name}>
          <form className="form-stack" onSubmit={submit} noValidate>
            <Field label="Chapter" required error={errors.chapterId}>
              <select className="field__control native-select" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
                <option value="">Select chapter</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Meeting title" required error={errors.title}>
              <input className="field__control" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <FieldGroup label="Meeting type" required>
              <div className="seg" role="group">
                <button type="button" aria-pressed={mode === 'offline'} onClick={() => setMode('offline')}>
                  Offline
                </button>
                <button type="button" aria-pressed={mode === 'online'} onClick={() => setMode('online')}>
                  Online
                </button>
              </div>
            </FieldGroup>

            <div className="form-grid form-grid--pair">
              <Field label="Date" required error={errors.when}>
                <input className="field__control" type="date" value={when.date} onChange={(e) => setWhen((w) => ({ ...w, date: e.target.value }))} />
              </Field>
              <Field label="Start time" required>
                <input className="field__control" type="time" value={when.time} onChange={(e) => setWhen((w) => ({ ...w, time: e.target.value }))} />
              </Field>
            </div>
            <Field label="Duration (minutes)" required hint="Attendance stays open until the meeting ends." error={errors.duration}>
              <input className="field__control" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value.replace(/\D/g, ''))} />
            </Field>

            {mode === 'offline' && (
              <>
                <Field label="Venue" required error={errors.venue}>
                  <input className="field__control" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Hotel or hall name, city" />
                </Field>
                <div className="form-grid form-grid--pair">
                  <Field label="Latitude" required error={errors.lat}>
                    <input className="field__control" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="8.526987" />
                  </Field>
                  <Field label="Longitude" required error={errors.lng}>
                    <input className="field__control" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="76.887900" />
                  </Field>
                </div>
                <div>
                  <button type="button" className="btn btn--line btn--sm" onClick={fillFromGps} disabled={locating}>
                    <LocateFixed size={15} /> {locating ? 'Locating…' : 'Use my current location'}
                  </button>
                </div>
                <Field label="Geofence radius (metres)" required hint="Members can mark attendance by location only within this distance of the venue." error={errors.radius}>
                  <input className="field__control" inputMode="numeric" value={radius} onChange={(e) => setRadius(e.target.value.replace(/\D/g, ''))} />
                </Field>
              </>
            )}

            <div>
              <button className="btn btn--primary" type="submit">
                <CalendarPlus size={16} /> Save meeting
              </button>
            </div>
          </form>
        </Sheet>

        <div className="list">
          <h2 className="list__title">
            All meetings <span>{meetings.length}</span>
          </h2>
          {meetings.length === 0 ? (
            <div className="empty">
              <b>No meetings yet.</b>
              Create the first one to open attendance for a chapter.
            </div>
          ) : (
            meetings.map((m) => {
              const chapter = db.chapters.find((c) => c.id === m.chapterId)
              const phase = phaseOf(m, now)
              const marked = db.attendance.filter((a) => a.meetingId === m.id).length
              const total = db.members.filter((x) => x.chapterId === m.chapterId).length
              return (
                <article key={m.id} className="row">
                  <Icon3D icon={m.mode === 'online' ? Video : MapPin} tone={m.mode === 'online' ? 'navy' : 'red'} size={50} />
                  <div className="row__main">
                    <b>
                      {m.title} · {chapter?.name ?? 'Chapter'}
                    </b>
                    <span>
                      {fmtDate(m.startsAt, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, {fmtTime(m.startsAt)} · {m.durationMin} min
                      {m.mode === 'offline' && ` · ${m.venue} · ${m.radiusM} m geofence`}
                    </span>
                  </div>
                  <div className="chips">
                    <span className="chip">{m.mode === 'online' ? 'Online' : 'Offline'}</span>
                    <span className={`stat ${phase === 'open' ? 'stat--ok' : phase === 'upcoming' ? 'stat--idle' : 'stat--bad'}`}>
                      {phase === 'open' ? 'Open' : phase === 'upcoming' ? 'Upcoming' : 'Ended'}
                    </span>
                    <span className="chip chip--gold">
                      {marked}/{total} present
                    </span>
                  </div>
                  <button
                    className="iconbtn"
                    aria-label={`Delete ${m.title}`}
                    onClick={() => {
                      deleteMeeting(m.id)
                      toast('Meeting deleted')
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
