import { useState } from 'react'
import type { FormEvent } from 'react'
import { Landmark, Layers, Map, Plus, UserPlus, Users } from 'lucide-react'
import { Field, Icon3D, PageHead, PinField, Sheet, StatStrip } from '../../components/ui'
import { fmtDate } from '../../lib/format'
import { createRegion, isMobile, isPin, useDB } from '../../lib/store'
import { useToast } from '../../lib/toast'

export default function Regions() {
  const db = useDB()
  const toast = useToast()
  const [name, setName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminMobile, setAdminMobile] = useState('')
  const [adminPin, setAdminPin] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Enter the region name.'
    if (!adminName.trim()) next.adminName = 'Enter the region admin’s name.'
    if (!isMobile(adminMobile)) next.adminMobile = 'Enter a 10-digit mobile number.'
    if (!isPin(adminPin)) next.pin = 'Password must be a 4-digit number.'
    setErrors(next)
    if (Object.keys(next).length) return

    const res = createRegion({ name, adminName, adminMobile, adminPin })
    if (res.error) return setErrors({ [res.field ?? 'form']: res.error })
    toast(`Region ${name.trim()} created`)
    setName('')
    setAdminName('')
    setAdminMobile('')
    setAdminPin('')
  }

  return (
    <div className="page">
      <PageHead eyebrow="Super Admin" icon={Map} title="Regions" subtitle="Create regions and the region admin login that manages each one." />

      <StatStrip
        items={[
          { icon: Map, tone: 'red', label: 'Regions', value: db.regions.length },
          { icon: Landmark, tone: 'wine', label: 'Chapters', value: db.chapters.length },
          { icon: Users, tone: 'green', label: 'Members', value: db.members.length },
          { icon: Layers, tone: 'gold', label: 'Plans', value: db.plans.length },
        ]}
      />

      <div className="duo">
        <Sheet icon={UserPlus} title="Create region" note="With its region admin login">
          <form className="form-stack" onSubmit={submit} noValidate>
            <Field label="Region name" required error={errors.name}>
              <input className="field__control" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Region admin name" required error={errors.adminName}>
              <input className="field__control" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </Field>
            <Field label="Region admin mobile (login username)" required error={errors.adminMobile}>
              <input
                className="field__control"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={adminMobile}
                onChange={(e) => setAdminMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </Field>
            <PinField value={adminPin} onChange={setAdminPin} error={errors.pin} />
            {errors.form && <div className="form-error">{errors.form}</div>}
            <div>
              <button className="btn btn--primary" type="submit">
                <Plus size={16} /> Save
              </button>
            </div>
          </form>
        </Sheet>

        <div className="list">
          <h2 className="list__title">
            All regions <span>{db.regions.length}</span>
          </h2>
          {db.regions.map((r) => (
            <article key={r.id} className="row">
              <Icon3D icon={Map} tone="red" size={50} />
              <div className="row__main">
                <b>{r.name}</b>
                <span>
                  {r.adminName} · {r.adminMobile} · since {fmtDate(r.createdAt, { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="chips">
                <span className="chip chip--gold">{db.chapters.filter((c) => c.regionId === r.id).length} chapters</span>
                <span className="chip">{db.members.filter((m) => m.regionId === r.id).length} members</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
