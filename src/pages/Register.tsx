import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Gem, Layers, Sparkles } from 'lucide-react'
import Backdrop from '../components/Backdrop'
import { BniMark, Field, Icon3D, PhotoField, PinField } from '../components/ui'
import { DESIGNATIONS } from '../data/seed'
import { inr } from '../lib/format'
import { MODES, modeLabel, priceFor } from '../lib/pricing'
import { isMobile, isPin, registerMember, useDB } from '../lib/store'
import type { Mode, Tone } from '../lib/types'

const STEPS = ['Region & Chapter', 'Choose Your Plan', 'Select Your Mode', 'Chapter Team']
const PLAN_ICONS = [
  { icon: Sparkles, tone: 'steel' as Tone },
  { icon: Layers, tone: 'gold' as Tone },
  { icon: Gem, tone: 'red' as Tone },
]

interface Done {
  name: string
  chapter: string
  region: string
  plan: string
  mode: Mode
  amount: number
}

export default function Register() {
  const db = useDB()
  const [step, setStep] = useState(1)
  const [regionId, setRegionId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [planId, setPlanId] = useState('')
  const [mode, setMode] = useState<Mode | ''>('')

  const [designation, setDesignation] = useState('')
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [category, setCategory] = useState('')
  const [mobile, setMobile] = useState('')
  const [pin, setPin] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Done | null>(null)

  const region = db.regions.find((r) => r.id === regionId)
  const chapters = db.chapters.filter((c) => c.regionId === regionId)
  const chapter = db.chapters.find((c) => c.id === chapterId)
  const plan = db.plans.find((p) => p.id === planId)

  /* What each step has picked so far, shown under its name in the side rail. */
  const picked = [
    chapter && region ? `${region.name} · ${chapter.name}` : '',
    plan ? plan.name : '',
    mode ? modeLabel(mode) : '',
    '',
  ]

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!region || !chapter || !plan || !mode) return
    const next: Record<string, string> = {}
    if (!designation) next.designation = 'Select a designation.'
    if (!name.trim()) next.name = 'Enter your name.'
    if (!isMobile(mobile)) next.mobile = 'Enter a 10-digit mobile number.'
    if (!isPin(pin)) next.pin = 'Password must be a 4-digit number.'
    setErrors(next)
    if (Object.keys(next).length) return

    const res = registerMember({ regionId, chapterId, planId, mode, designation, name, mobile, pin, photo, organisation, category })
    if (res.error) return setErrors({ [res.field ?? 'form']: res.error })
    setDone({ name: name.trim(), chapter: chapter.name, region: region.name, plan: plan.name, mode, amount: priceFor(plan, mode).total })
  }

  return (
    <>
      <Backdrop />
      <div className="reg">
        <div className="regshell">
          <aside className="regside">
            <div className="regside__brand">
              <BniMark size={46} />
              <div>
                <b>BNI Chapter</b>
                <span>Member registration</span>
              </div>
            </div>

            <ol className="steps" aria-label="Registration steps">
              {STEPS.map((label, i) => {
                const state = done || step > i + 1 ? 'is-done' : step === i + 1 ? 'is-on' : ''
                return (
                  <li key={label} className={state} aria-current={step === i + 1 && !done ? 'step' : undefined}>
                    <span className="steps__n">{state === 'is-done' ? <Check size={15} strokeWidth={3} /> : i + 1}</span>
                    <span>
                      <span className="steps__label">{label}</span>
                      {picked[i] && <span className="steps__value">{picked[i]}</span>}
                    </span>
                  </li>
                )
              })}
            </ol>

            <Link className="btn btn--line btn--sm regside__login" to="/login">
              Already registered? Login
            </Link>
          </aside>

          <section className="regmain">
            {done ? (
              <div className="reg__done">
                <Icon3D icon={Check} tone="green" size={76} />
                <h1>Registration complete</h1>
                <p>
                  Welcome, {done.name}. Sign in with your mobile number and the 4-digit password you just set. You will be asked to update
                  your profile on your first login.
                </p>
                <dl className="kv">
                  <div>
                    <dt>Region</dt>
                    <dd>{done.region}</dd>
                  </div>
                  <div>
                    <dt>Chapter</dt>
                    <dd>{done.chapter}</dd>
                  </div>
                  <div>
                    <dt>Plan</dt>
                    <dd>{done.plan}</dd>
                  </div>
                  <div>
                    <dt>Mode</dt>
                    <dd>{modeLabel(done.mode)}</dd>
                  </div>
                  <div>
                    <dt>Amount (incl. tax)</dt>
                    <dd>{inr(done.amount)}</dd>
                  </div>
                </dl>
                <p className="reg__note">Online payment is not part of this prototype; the amount is only recorded against your registration.</p>
                <Link className="btn btn--primary" to="/login">
                  Go to login <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <h1 className="reg__title">Select your region and chapter</h1>
                    <p className="reg__sub">Choose the region first, then the chapter you belong to.</p>
                    <div className="form-stack">
                      <Field label="Region" required>
                        <select
                          className="field__control native-select"
                          value={regionId}
                          onChange={(e) => {
                            setRegionId(e.target.value)
                            setChapterId('')
                          }}
                        >
                          <option value="">Select Region</option>
                          {db.regions.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        label="Chapter"
                        required
                        hint={regionId && chapters.length === 0 ? 'No chapters have been created in this region yet.' : undefined}
                      >
                        <select
                          className="field__control native-select"
                          value={chapterId}
                          disabled={!regionId || chapters.length === 0}
                          onChange={(e) => setChapterId(e.target.value)}
                        >
                          <option value="">{regionId ? 'Select Chapter' : 'Select a region first'}</option>
                          {chapters.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} — {c.city}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="reg__foot reg__foot--end">
                      <button className="btn btn--primary" disabled={!regionId || !chapterId} onClick={() => setStep(2)}>
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1 className="reg__title">Choose Your Plan</h1>
                    <p className="reg__sub">
                      {chapter?.name}, {region?.name}
                    </p>
                    {db.plans.length === 0 ? (
                      <div className="empty">No plans have been created yet. Please contact your region admin.</div>
                    ) : (
                      <div className="plans">
                        {db.plans.map((p, i) => {
                          const price = priceFor(p, 'monthly')
                          const look = PLAN_ICONS[i % PLAN_ICONS.length]
                          return (
                            <article key={p.id} className={`plan ${planId === p.id ? 'is-on' : ''}`}>
                              <div className="plan__top">
                                <Icon3D icon={look.icon} tone={look.tone} size={44} />
                                <h2>{p.name}</h2>
                              </div>
                              <div className="plan__price">
                                {inr(p.rate)}
                                <small> / month</small>
                              </div>
                              <div className="plan__tax">
                                + {p.taxPercent}% tax · {inr(price.total)} per month
                              </div>
                              <p className="plan__desc">{p.description}</p>
                              <button
                                className="btn btn--primary btn--block"
                                onClick={() => {
                                  setPlanId(p.id)
                                  setStep(3)
                                }}
                              >
                                Select Plan
                              </button>
                            </article>
                          )
                        })}
                      </div>
                    )}
                    <div className="reg__foot">
                      <button className="btn btn--ghost" onClick={() => setStep(1)}>
                        <ArrowLeft size={16} /> Back
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && plan && (
                  <>
                    <h1 className="reg__title">Select your mode</h1>
                    <p className="reg__sub">
                      {plan.name} plan · {inr(plan.rate)} per month + {plan.taxPercent}% tax
                    </p>
                    <div className="modes" role="radiogroup" aria-label="Payment mode">
                      {MODES.map((m) => {
                        const price = priceFor(plan, m.key)
                        return (
                          <button
                            key={m.key}
                            type="button"
                            role="radio"
                            aria-checked={mode === m.key}
                            className={`mode ${mode === m.key ? 'is-on' : ''}`}
                            onClick={() => setMode(m.key)}
                          >
                            <span className="mode__check">{mode === m.key && <Check size={14} strokeWidth={3} />}</span>
                            <span className="mode__title">{m.label}</span>
                            <span className="mode__note">{m.note}</span>
                            <span className="mode__total">{inr(price.total)}</span>
                            <span className="mode__break">
                              {inr(price.base)} + {inr(price.tax)} tax
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="reg__foot">
                      <button className="btn btn--ghost" onClick={() => setStep(2)}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button className="btn btn--primary" disabled={!mode} onClick={() => setStep(4)}>
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <form onSubmit={submit} noValidate>
                    <h1 className="reg__title">Chapter Team</h1>
                    <p className="reg__sub">Tell us who you are. You will log in with your mobile number and password.</p>
                    <div className="form-grid">
                      <Field label="Region">
                        <input className="field__control" value={region?.name ?? ''} disabled />
                      </Field>
                      <Field label="Chapter" required>
                        <input className="field__control" value={chapter?.name ?? ''} disabled />
                      </Field>
                      <Field label="Designation" required error={errors.designation}>
                        <select className="field__control native-select" value={designation} onChange={(e) => setDesignation(e.target.value)}>
                          <option value="">Select Designation</option>
                          {DESIGNATIONS.map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Name" required error={errors.name}>
                        <input className="field__control" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                      </Field>
                      <PhotoField value={photo} onChange={setPhoto} />
                      <Field label="Organization">
                        <input className="field__control" value={organisation} onChange={(e) => setOrganisation(e.target.value)} autoComplete="organization" />
                      </Field>
                      <Field label="Category" hint="Your business category, e.g. Chartered Accountant">
                        <input className="field__control" value={category} onChange={(e) => setCategory(e.target.value)} />
                      </Field>
                      <Field label="Mobile number (login username)" required error={errors.mobile}>
                        <input
                          className="field__control"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="10-digit mobile number"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </Field>
                      <PinField value={pin} onChange={setPin} error={errors.pin} />
                    </div>
                    {errors.form && <div className="form-error" style={{ marginTop: 18 }}>{errors.form}</div>}
                    <div className="reg__foot">
                      <button type="button" className="btn btn--ghost" onClick={() => setStep(3)}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button type="submit" className="btn btn--primary">
                        <CircleCheck size={17} /> Register
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
