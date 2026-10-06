import { useState } from 'react'
import type { FormEvent } from 'react'
import { Landmark, Plus, Users } from 'lucide-react'
import { Field, PageHead, Panel, StatTile } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { fmtDate } from '../../lib/format'
import { createChapter, useDB } from '../../lib/store'
import { useToast } from '../../lib/toast'

export default function Chapters() {
  const { region } = useAuth()
  const db = useDB()
  const toast = useToast()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!region) return null
  const chapters = db.chapters.filter((c) => c.regionId === region.id)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!region) return
    if (!name.trim()) return setErrors({ name: 'Enter the chapter name.' })
    const res = createChapter(region.id, { name, city })
    if (res.error) return setErrors({ [res.field ?? 'form']: res.error })
    toast(`Chapter ${name.trim()} created`)
    setName('')
    setCity('')
    setErrors({})
  }

  return (
    <div className="page">
      <PageHead
        title="Chapters"
        subtitle={`Create the chapters of ${region.name}. Members choose their region and chapter when they register.`}
        icon={Landmark}
        tone="navy"
      />

      <div className="tiles tiles--2">
        <StatTile icon={Landmark} tone="navy" label="Chapters" value={chapters.length} />
        <StatTile icon={Users} tone="green" label="Members" value={db.members.filter((m) => m.regionId === region.id).length} />
      </div>

      <div className="split">
        <Panel icon={Plus} title="Create Chapter">
          <form className="form-stack" onSubmit={submit} noValidate>
            <Field label="Region">
              <input className="field__control" value={region.name} disabled />
            </Field>
            <Field label="Chapter name" required error={errors.name}>
              <input className="field__control" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="City">
              <input className="field__control" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            {errors.form && <div className="form-error">{errors.form}</div>}
            <div>
              <button className="btn btn--primary" type="submit">
                <Plus size={16} /> Save
              </button>
            </div>
          </form>
        </Panel>

        <Panel icon={Landmark} title="View Details">
          {chapters.length === 0 ? (
            <div className="empty">
              <b>No chapters yet.</b>
              Create the first one to let members register.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>SL NO</th>
                    <th>Chapter</th>
                    <th>City</th>
                    <th className="r">Members</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td>
                        <b>{c.name}</b>
                      </td>
                      <td>{c.city || '—'}</td>
                      <td className="num">{db.members.filter((m) => m.chapterId === c.id).length}</td>
                      <td>{fmtDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
