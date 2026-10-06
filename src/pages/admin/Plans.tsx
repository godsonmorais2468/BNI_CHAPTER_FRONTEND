import { useState } from 'react'
import type { FormEvent } from 'react'
import { Gem, Layers, Pencil, Plus, Sparkles } from 'lucide-react'
import { Field, Icon3D, PageHead, Sheet } from '../../components/ui'
import { inr } from '../../lib/format'
import { priceFor } from '../../lib/pricing'
import { createPlan, updatePlan, useDB } from '../../lib/store'
import { useToast } from '../../lib/toast'
import type { Plan, Tone } from '../../lib/types'

const LOOKS = [
  { icon: Sparkles, tone: 'steel' as Tone },
  { icon: Layers, tone: 'gold' as Tone },
  { icon: Gem, tone: 'red' as Tone },
]

export default function Plans() {
  const db = useDB()
  const toast = useToast()
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rate, setRate] = useState('')
  const [tax, setTax] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const preview: Plan | null = Number(rate) > 0 ? { id: '', name, description, rate: Number(rate), taxPercent: Number(tax) || 0 } : null

  function reset() {
    setEditing(null)
    setName('')
    setDescription('')
    setRate('')
    setTax('')
    setErrors({})
  }

  function edit(p: Plan) {
    setEditing(p.id)
    setName(p.name)
    setDescription(p.description)
    setRate(String(p.rate))
    setTax(String(p.taxPercent))
    setErrors({})
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Enter the plan name.'
    if (!(Number(rate) > 0)) next.rate = 'Enter a rate greater than 0.'
    if (tax === '' || Number(tax) < 0 || Number(tax) > 100) next.tax = 'Enter a tax between 0 and 100.'
    setErrors(next)
    if (Object.keys(next).length) return

    const input = { name, description, rate: Number(rate), taxPercent: Number(tax) }
    const res = editing ? updatePlan(editing, input) : createPlan(input)
    if (res.error) return setErrors({ [res.field ?? 'form']: res.error })
    toast(editing ? 'Plan updated' : `Plan ${name.trim()} created`)
    reset()
  }

  return (
    <div className="page">
      <PageHead
        eyebrow="Super Admin"
        icon={Layers}
        tone="gold"
        title="Plans"
        subtitle="Set the monthly rate and tax for each plan. Members pick one while registering."
      />

      <div className="duo">
        <Sheet icon={editing ? Pencil : Plus} tone="gold" title={editing ? 'Update plan' : 'Create plan'} note="Rate and tax">
          <form className="form-stack" onSubmit={submit} noValidate>
            <Field label="Plan name" required error={errors.name}>
              <input className="field__control" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className="field__control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this plan includes" />
            </Field>
            <div className="form-grid form-grid--2">
              <Field label="Rate per month (₹)" required error={errors.rate}>
                <input className="field__control" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ''))} />
              </Field>
              <Field label="Tax (%)" required error={errors.tax}>
                <input
                  className="field__control"
                  inputMode="decimal"
                  placeholder="18"
                  value={tax}
                  onChange={(e) => setTax(e.target.value.replace(/[^\d.]/g, ''))}
                />
              </Field>
            </div>

            {preview && (
              <div className="preview">
                <div>
                  <span>Monthly total</span>
                  <b>{inr(priceFor(preview, 'monthly').total)}</b>
                </div>
                <div>
                  <span>6-month total</span>
                  <b>{inr(priceFor(preview, 'tenure').total)}</b>
                </div>
              </div>
            )}

            {errors.form && <div className="form-error">{errors.form}</div>}
            <div className="btn-row">
              <button className="btn btn--primary" type="submit">
                {editing ? 'Update' : 'Save'}
              </button>
              {editing && (
                <button className="btn btn--ghost" type="button" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Sheet>

        <div className="list">
          <h2 className="list__title">
            All plans <span>{db.plans.length}</span>
          </h2>
          <div className="plans">
            {db.plans.map((p, i) => {
              const look = LOOKS[i % LOOKS.length]
              return (
                <article key={p.id} className={`plan ${editing === p.id ? 'is-on' : ''}`}>
                  <div className="plan__top">
                    <Icon3D icon={look.icon} tone={look.tone} size={44} />
                    <h2>{p.name}</h2>
                  </div>
                  <div className="plan__price">
                    {inr(p.rate)}
                    <small> / month</small>
                  </div>
                  <div className="plan__tax">+ {p.taxPercent}% tax</div>
                  <p className="plan__desc">{p.description || 'No description.'}</p>
                  <div className="plan__totals">
                    <div>
                      <span>Monthly</span>
                      <b>{inr(priceFor(p, 'monthly').total)}</b>
                    </div>
                    <div>
                      <span>6 months</span>
                      <b>{inr(priceFor(p, 'tenure').total)}</b>
                    </div>
                  </div>
                  <button className="btn btn--line btn--sm" onClick={() => edit(p)}>
                    <Pencil size={14} /> Edit
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
