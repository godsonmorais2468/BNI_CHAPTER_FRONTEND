import { useState } from 'react'
import type { FormEvent } from 'react'
import { Landmark, Layers, Map, Plus, UserPlus, Users } from 'lucide-react'
import { Field, PageHead, Panel, PinField, StatTile } from '../../components/ui'
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
      <PageHead title="Regions" subtitle="Create regions and the region admin login that manages each one." icon={Map} />

      <div className="tiles">
        <StatTile icon={Map} tone="red" label="Regions" value={db.regions.length} />
        <StatTile icon={Landmark} tone="navy" label="Chapters" value={db.chapters.length} />
        <StatTile icon={Users} tone="green" label="Members" value={db.members.length} />
        <StatTile icon={Layers} tone="gold" label="Plans" value={db.plans.length} />
      </div>

      <div className="split">
        <Panel icon={UserPlus} title="Create Region">
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
        </Panel>

        <Panel icon={Map} title="View Details">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>SL NO</th>
                  <th>Region</th>
                  <th>Region admin</th>
                  <th>Mobile</th>
                  <th className="r">Chapters</th>
                  <th className="r">Members</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {db.regions.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <b>{r.name}</b>
                    </td>
                    <td>{r.adminName}</td>
                    <td>{r.adminMobile}</td>
                    <td className="num">{db.chapters.filter((c) => c.regionId === r.id).length}</td>
                    <td className="num">{db.members.filter((m) => m.regionId === r.id).length}</td>
                    <td>{fmtDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  )
}
