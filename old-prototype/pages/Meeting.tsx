import { useEffect, useRef, useState } from 'react'
import { Mic, Pause, Play, Plus, RotateCcw, SkipBack, SkipForward, Timer } from 'lucide-react'
import { Avatar, Icon3D, PageHead } from '../components/ui'
import { AGENDA, CHAPTER, MEMBERS, NEXT_MEETING, TEAMS } from '../data/mock'
import { clock, fmtDate } from '../lib/format'

const SLOT = 60
const R = 92
const CIRC = 2 * Math.PI * R
const ROUND_INDEX = AGENDA.findIndex((a) => a.round)
const FEATURE = MEMBERS.find((m) => m.name === 'Jyothi Kannan') ?? MEMBERS[0]

export default function Meeting() {
  const [stage, setStage] = useState(ROUND_INDEX)
  const [current, setCurrent] = useState(0)
  const [remaining, setRemaining] = useState(SLOT)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [running])

  function goTo(i: number) {
    setCurrent(Math.max(0, Math.min(i, MEMBERS.length - 1)))
    setRemaining(SLOT)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).closest('input, textarea, select, button')) return
      if (e.key === ' ') {
        e.preventDefault()
        setRunning((r) => !r)
      } else if (e.key === 'ArrowRight') {
        setCurrent((c) => Math.min(c + 1, MEMBERS.length - 1))
        setRemaining(SLOT)
      } else if (e.key === 'ArrowLeft') {
        setCurrent((c) => Math.max(c - 1, 0))
        setRemaining(SLOT)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* Keep the current presenter in view inside the queue without scrolling the page. */
  const queueRef = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const queue = queueRef.current
    const row = queue?.children[current] as HTMLElement | undefined
    if (queue && row) queue.scrollTo({ top: row.offsetTop - queue.offsetTop - 50, behavior: 'smooth' })
  }, [current])

  const speaker = MEMBERS[current]
  const over = remaining < 0
  const progress = Math.max(0, Math.min(1, remaining / SLOT))
  const arcColor = over || remaining <= 5 ? 'var(--red-bright)' : remaining <= 15 ? 'var(--gold)' : '#fff'
  const roundPct = (current / MEMBERS.length) * 100

  return (
    <div className="page">
      <PageHead
        icon={Timer}
        tone="navy"
        kicker={`Weekly meeting · ${fmtDate(NEXT_MEETING, { weekday: 'long', day: 'numeric', month: 'long' })}`}
        title={
          <>
            Run of <em>show.</em>
          </>
        }
        lede={`07:00 – 08:30 at ${CHAPTER.venue}. Click an agenda item to mark where the room is; drive the 60-second round from the console.`}
        actions={
          <button className="btn btn--ink" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pause round' : 'Start 60-second round'}
          </button>
        }
      />

      <div className="meet">
        <div>
          <section className="card" style={{ padding: 10 }}>
            <ol className="agenda">
              {AGENDA.map((a, i) => (
                <li
                  key={a.title}
                  className={i < stage ? 'is-done' : i === stage ? 'is-now' : ''}
                  onClick={() => setStage(i)}
                >
                  <time>{a.time}</time>
                  <div>
                    <h4>{a.title}</h4>
                    <p>{a.owner}</p>
                    {a.round && i === stage && (
                      <div className="agenda__progress" aria-label={`${current} of ${MEMBERS.length} presented`}>
                        <i style={{ width: `${roundPct}%` }} />
                      </div>
                    )}
                  </div>
                  <span className="agenda__mins">{a.mins}′</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card feature">
            <Avatar name={FEATURE.name} tone={TEAMS[FEATURE.team].tone} size={64} />
            <div>
              <div className="card__meta" style={{ color: 'var(--red)' }}>
                Feature presentation · 10 min
              </div>
              <h3 className="card__title" style={{ marginTop: 6 }}>
                “Smiles that sell: what your team’s teeth say about your brand”
              </h3>
              <p style={{ color: 'var(--ink-soft)', marginTop: 6 }}>
                {FEATURE.name} · {FEATURE.business}
              </p>
            </div>
          </section>
        </div>

        <section className="console" aria-label="Presenter console">
          <div className="console__head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon3D icon={Mic} tone="red" size={34} />
              <div className="kicker">60-second round</div>
            </div>
            <span className="console__count">
              {String(current + 1).padStart(2, '0')} / {MEMBERS.length}
            </span>
          </div>

          <div className="console__stage">
            <div className={`ring ${over ? 'is-over' : ''}`}>
              <svg viewBox="0 0 210 210" aria-hidden>
                <circle className="ring__track" cx="105" cy="105" r={R} />
                <circle
                  className="ring__arc"
                  cx="105"
                  cy="105"
                  r={R}
                  stroke={arcColor}
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - (over ? 1 : progress))}
                />
              </svg>
              <div className="ring__t" role="timer" aria-live="off">
                <div className="ring__n">
                  {over && '+'}
                  {clock(remaining)}
                </div>
                <div className="ring__u">{over ? 'Over time' : running ? 'Speaking' : 'Ready'}</div>
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="speaker__name">{speaker.name}</div>
              <div className="speaker__biz">
                {speaker.business} · {speaker.category}
              </div>
              <div className="speaker__ask">
                <small>Ask</small>“{speaker.ask}.”
              </div>
            </div>
          </div>

          <div className="console__controls">
            <button className="btn btn--glass" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label="Previous presenter">
              <SkipBack size={16} />
            </button>
            <button className="btn btn--primary" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button className="btn btn--glass" onClick={() => setRemaining((r) => r + 15)}>
              <Plus size={16} /> 15s
            </button>
            <button
              className="btn btn--glass"
              onClick={() => {
                setRunning(false)
                setRemaining(SLOT)
              }}
              aria-label="Reset timer"
            >
              <RotateCcw size={16} />
            </button>
            <button className="btn btn--light" onClick={() => goTo(current + 1)} disabled={current === MEMBERS.length - 1}>
              Next <SkipForward size={16} />
            </button>
          </div>

          <ol className="queue" ref={queueRef}>
            {MEMBERS.map((m, i) => (
              <li key={m.id} className={i < current ? 'is-done' : i === current ? 'is-now' : ''}>
                <span className="queue__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="queue__name">{m.name}</span>
                <span className="queue__cat">{m.category}</span>
              </li>
            ))}
          </ol>

          <div className="console__hint">
            <span>
              <span className="kbd">Space</span> start / pause
            </span>
            <span>
              <span className="kbd">←</span> <span className="kbd">→</span> presenter
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
