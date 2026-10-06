import { useState } from 'react'
import type { FormEvent } from 'react'
import { Landmark, MapPin, Plus, Users } from 'lucide-react'
import { Field, Icon3D, PageHead, Sheet, StatStrip } from '../../components/ui'
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
        eyebrow={`Region Admin · ${region.name}`}
        icon={Landmark}
        tone="wine"
        title="Chapters"
        subtitle="Create the chapters of your region. Members choose their region and chapter when they register."
      />

      <StatStrip
        items={[
          { icon: Landmark, tone: 'wine', label: 'Chapters', value: chapters.length },
          { icon: Users, tone: 'green', label: 'Members', value: db.members.filter((m) => m.regionId === region.id).length },
        ]}
      />

      <div className="duo">
        <Sheet icon={Plus} tone="wine" title="Create chapter" note={region.name}>
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
        </Sheet>

        <div className="list">
          <h2 className="list__title">
            All chapters <span>{chapters.length}</span>
          </h2>
          {chapters.length === 0 ? (
            <div className="empty">
              <b>No chapters yet.</b>
              Create the first one to let members register.
            </div>
          ) : (
            chapters.map((c) => (
              <article key={c.id} className="row">
                <Icon3D icon={Landmark} tone="wine" size={50} />
                <div className="row__main">
                  <b>{c.name}</b>
                  <span>
                    {c.city || 'No city'} · created {fmtDate(c.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="chips">
                  {c.city && (
                    <span className="chip">
                      <MapPin size={13} /> {c.city}
                    </span>
                  )}
                  <span className="chip chip--gold">{db.members.filter((m) => m.chapterId === c.id).length} members</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
