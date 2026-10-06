import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, Handshake, IndianRupee, Phone, Plus, Send, Target, Trophy, Wallet } from 'lucide-react'
import { Icon3D, Modal, PageHead, Temp } from '../components/ui'
import { MEMBERS, REFERRALS, memberById } from '../data/mock'
import type { Referral, Stage, Tone } from '../data/mock'
import { useAuth } from '../lib/auth'
import { inr, inrCompact, shortName } from '../lib/format'
import { useToast } from '../lib/toast'

const STAGES: { key: Stage; label: string; hint: string; icon: typeof Send; tone: Tone }[] = [
  { key: 'passed', label: 'Passed', hint: 'Slip handed over', icon: Send, tone: 'red' },
  { key: 'contacted', label: 'Contacted', hint: 'First call made', icon: Phone, tone: 'steel' },
  { key: 'meeting', label: 'Meeting set', hint: 'Prospect engaged', icon: Handshake, tone: 'navy' },
  { key: 'closed', label: 'Closed', hint: 'Thank you for closed business', icon: Trophy, tone: 'green' },
]

const sum = (list: Referral[]) => list.reduce((s, r) => s + r.value, 0)

export default function Referrals() {
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState<Referral[]>(REFERRALS)
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<Stage | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)

  const showForm = params.get('new') === '1'
  const presetTo = params.get('to') ?? ''

  function move(id: string, stage: Stage) {
    setItems((list) => list.map((r) => (r.id === id ? { ...r, stage } : r)))
    if (stage === 'closed') {
      const r = items.find((x) => x.id === id)
      if (r) toast(`TYFCB ${inrCompact(r.value)} recorded for ${shortName(memberById(r.to)?.name ?? '')}`)
    }
  }

  function advance(r: Referral) {
    const next = STAGES[STAGES.findIndex((s) => s.key === r.stage) + 1]
    if (next) move(r.id, next.key)
  }

  function add(r: Omit<Referral, 'id' | 'from' | 'stage' | 'days'>) {
    const id = `r${Date.now()}`
    setItems((list) => [{ ...r, id, from: user?.memberId ?? 'm1', stage: 'passed', days: 0 }, ...list])
    setFresh(id)
    setParams({})
    toast(`Referral passed to ${memberById(r.to)?.name ?? 'member'}`)
  }

  const open = items.filter((r) => r.stage !== 'closed')
  const closed = items.filter((r) => r.stage === 'closed')
  const conversion = Math.round((closed.length / items.length) * 100)

  return (
    <div className="page">
      <PageHead
        icon={ArrowLeftRight}
        tone="gold"
        kicker="Givers gain"
        title={
          <>
            Referral <em>pipeline.</em>
          </>
        }
        lede="Every slip from the moment it’s passed to the thank-you for closed business. Drag cards between columns or use the arrow to move them on."
        actions={
          <button className="btn btn--primary" onClick={() => setParams({ new: '1' })}>
            <Plus size={16} /> Log a referral
          </button>
        }
      />

      <div className="rstats">
        {(
          [
            ['Open referrals', String(open.length), Send, 'red'],
            ['Pipeline value', inrCompact(sum(open)), Wallet, 'navy'],
            ['TYFCB closed', inrCompact(sum(closed)), IndianRupee, 'gold'],
            ['Conversion', `${conversion}%`, Target, 'green'],
          ] as const
        ).map(([label, value, icon, tone]) => (
          <div className="rstat" key={label}>
            <Icon3D icon={icon} tone={tone} size={48} />
            <div>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          </div>
        ))}
      </div>

      <div className="board">
        {STAGES.map((s) => {
          const cards = items.filter((r) => r.stage === s.key)
          return (
            <section
              key={s.key}
              className={`col col--${s.key} ${over === s.key ? 'is-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(s.key)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragId) move(dragId, s.key)
                setDragId(null)
                setOver(null)
              }}
            >
              <header className="col__head">
                <div className="col__titlewrap">
                  <Icon3D icon={s.icon} tone={s.tone} size={34} />
                  <div>
                    <h3 className="col__title">{s.label}</h3>
                    <div className="col__hint">{s.hint}</div>
                  </div>
                </div>
                <div className="col__count">
                  <b>{cards.length}</b>
                  {inrCompact(sum(cards))}
                </div>
              </header>

              {cards.length === 0 && <div className="col__empty">Drop a referral here</div>}

              {cards.map((r) => {
                const from = memberById(r.from)
                const to = memberById(r.to)
                return (
                  <article
                    key={r.id}
                    className={`rcard ${dragId === r.id ? 'is-dragging' : ''} ${fresh === r.id ? 'is-new' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move'
                      setDragId(r.id)
                    }}
                    onDragEnd={() => {
                      setDragId(null)
                      setOver(null)
                    }}
                  >
                    <div className="rcard__top">
                      <h4 className="rcard__p">{r.prospect}</h4>
                      <Temp level={r.temp} />
                    </div>
                    <div className="rcard__route">
                      {shortName(from?.name ?? '')} <ArrowRight size={13} /> <strong>{shortName(to?.name ?? '')}</strong>
                    </div>
                    <p className="rcard__need">{r.need}</p>
                    <div className="rcard__foot">
                      <span className="rcard__value">{inrCompact(r.value)}</span>
                      <span className="rcard__age">{r.days === 0 ? 'today' : `${r.days}d ago`}</span>
                      {r.stage !== 'closed' && (
                        <button className="rcard__move" onClick={() => advance(r)} aria-label={`Move ${r.prospect} to the next stage`} title="Move to next stage">
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </section>
          )
        })}
      </div>

      {showForm && <ReferralForm presetTo={presetTo} me={user?.memberId ?? ''} onClose={() => setParams({})} onSubmit={add} />}
    </div>
  )
}

function ReferralForm({
  presetTo,
  me,
  onClose,
  onSubmit,
}: {
  presetTo: string
  me: string
  onClose: () => void
  onSubmit: (r: Omit<Referral, 'id' | 'from' | 'stage' | 'days'>) => void
}) {
  const [to, setTo] = useState(presetTo)
  const [prospect, setProspect] = useState('')
  const [need, setNeed] = useState('')
  const [value, setValue] = useState('')
  const [temp, setTemp] = useState<1 | 2 | 3>(2)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!to) next.to = 'Choose who receives this referral.'
    if (!prospect.trim()) next.prospect = 'Who is the prospect?'
    if (!need.trim()) next.need = 'Describe what they need.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSubmit({ to, prospect: prospect.trim(), need: need.trim(), value: Number(value) || 0, temp })
  }

  return (
    <Modal
      kicker="New referral slip"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn--ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" type="submit" form="ref-form">
            Pass referral <ArrowRight size={16} />
          </button>
        </>
      }
    >
      <form id="ref-form" className="modal__body" onSubmit={submit} noValidate>
        <label className={`field ${errors.to ? 'field--invalid' : ''}`}>
          <span className="field__label">To member</span>
          <select className="field__control native-select" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Select a member…</option>
            {MEMBERS.filter((m) => m.id !== me).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.category}
              </option>
            ))}
          </select>
          {errors.to && <span className="field__error">{errors.to}</span>}
        </label>

        <div className="form-grid">
          <label className={`field ${errors.prospect ? 'field--invalid' : ''}`}>
            <span className="field__label">Prospect</span>
            <input className="field__control" value={prospect} onChange={(e) => setProspect(e.target.value)} placeholder="Name or company" />
            {errors.prospect && <span className="field__error">{errors.prospect}</span>}
          </label>
          <label className="field">
            <span className="field__label">Estimated value (₹)</span>
            <input
              className="field__control mono"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
              placeholder="150000"
            />
            {Number(value) > 0 && <span className="field__label" style={{ color: 'var(--ink-mute)' }}>{inr(Number(value))}</span>}
          </label>
        </div>

        <label className={`field ${errors.need ? 'field--invalid' : ''}`}>
          <span className="field__label">What they need</span>
          <textarea className="field__control" value={need} onChange={(e) => setNeed(e.target.value)} placeholder="A short note for the receiving member" />
          {errors.need && <span className="field__error">{errors.need}</span>}
        </label>

        <div className="field">
          <span className="field__label">How warm is it?</span>
          <div className="tempick" role="group" aria-label="Temperature">
            {(['Cold', 'Warm', 'Hot'] as const).map((label, i) => {
              const level = (i + 1) as 1 | 2 | 3
              return (
                <button key={label} type="button" aria-pressed={temp === level} onClick={() => setTemp(level)}>
                  <Temp level={level} /> {label}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
