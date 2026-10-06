import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, Circle, Lock, Save, UserRound } from 'lucide-react'
import { Field, FieldGroup, PageHead, PhotoField } from '../../components/ui'
import { DESIGNATIONS } from '../../data/seed'
import { useAuth } from '../../lib/auth'
import { checklist, percent } from '../../lib/profile'
import { saveProfile, skipProfile } from '../../lib/store'
import { useToast } from '../../lib/toast'
import type { Married, Member } from '../../lib/types'

const TODAY_ISO = new Date().toISOString().slice(0, 10)

export default function MyProfile() {
  const { member } = useAuth()
  if (!member) return null
  return <ProfileForm key={member.id} member={member} />
}

function ProfileForm({ member }: { member: Member }) {
  const navigate = useNavigate()
  const toast = useToast()
  const first = member.profileState === 'pending'

  const [designation, setDesignation] = useState(member.designation)
  const [organisation, setOrganisation] = useState(member.organisation)
  const [category, setCategory] = useState(member.category)
  const [photo, setPhoto] = useState(member.photo)
  const [email, setEmail] = useState(member.profile.email)
  const [website, setWebsite] = useState(member.profile.website)
  const [social, setSocial] = useState(member.profile.social)
  const [dob, setDob] = useState(member.profile.dob)
  const [married, setMarried] = useState<Married>(member.profile.married)
  const [anniversary, setAnniversary] = useState(member.profile.anniversary)
  const [spouse, setSpouse] = useState(member.profile.spouse)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* The progress card follows the form as it is filled in. */
  const draft: Member = {
    ...member,
    designation,
    organisation,
    category,
    photo,
    profile: { email, website, social, dob, married, anniversary, spouse },
  }
  const items = checklist(draft)
  const pct = percent(draft)

  function submit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.'
    if (website.trim() && !/^\S+\.\S+$/.test(website.trim())) next.website = 'Enter a valid website, e.g. www.example.com.'
    if (married === 'yes') {
      if (!anniversary) next.anniversary = 'Enter your anniversary date.'
      if (!spouse.trim()) next.spouse = 'Enter your spouse’s name.'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    saveProfile(member.id, {
      designation,
      organisation,
      category,
      photo,
      profile: {
        email: email.trim(),
        website: website.trim(),
        social: social.trim(),
        dob,
        married,
        anniversary: married === 'yes' ? anniversary : '',
        spouse: married === 'yes' ? spouse.trim() : '',
      },
    })
    toast('Profile saved')
    navigate('/')
  }

  return (
    <div className="page">
      <PageHead
        title={first ? 'Update your profile' : 'My profile'}
        subtitle={first ? 'Add a few details so other members can reach you. You can skip this and finish later.' : 'Keep your details up to date.'}
        icon={UserRound}
        tone="gold"
        actions={
          first && (
            <button
              className="btn btn--line"
              onClick={() => {
                skipProfile(member.id)
                navigate('/')
              }}
            >
              Skip for now
            </button>
          )
        }
      />

      <div className="pf">
        <form className="card pf__form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <Field label="Name">
              <span className="lockwrap">
                <input className="field__control" value={member.name} disabled />
                <Lock size={16} />
              </span>
            </Field>
            <Field label="Mobile number">
              <span className="lockwrap">
                <input className="field__control" value={member.mobile} disabled />
                <Lock size={16} />
              </span>
            </Field>
            <Field label="Designation">
              <select className="field__control native-select" value={designation} onChange={(e) => setDesignation(e.target.value)}>
                {DESIGNATIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Organization">
              <input className="field__control" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
            </Field>
            <Field label="Category">
              <input className="field__control" value={category} onChange={(e) => setCategory(e.target.value)} />
            </Field>
            <PhotoField label="Photo (Max Size 1MB)" value={photo} onChange={setPhoto} />
            <Field label="Email" error={errors.email}>
              <input className="field__control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </Field>
            <Field label="Website" error={errors.website}>
              <input className="field__control" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.example.com" />
            </Field>
            <Field label="Social media">
              <input className="field__control" value={social} onChange={(e) => setSocial(e.target.value)} placeholder="Instagram, LinkedIn or Facebook link" />
            </Field>
            <Field label="Birthday">
              <input className="field__control" type="date" max={TODAY_ISO} value={dob} onChange={(e) => setDob(e.target.value)} />
            </Field>
            <FieldGroup label="Married?">
              <div className="seg" role="group">
                <button type="button" aria-pressed={married === 'yes'} onClick={() => setMarried('yes')}>
                  Yes
                </button>
                <button type="button" aria-pressed={married === 'no'} onClick={() => setMarried('no')}>
                  No
                </button>
              </div>
            </FieldGroup>
            {married === 'yes' && (
              <>
                <Field label="Anniversary" required error={errors.anniversary}>
                  <input className="field__control" type="date" max={TODAY_ISO} value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
                </Field>
                <Field label="Spouse name" required error={errors.spouse}>
                  <input className="field__control" value={spouse} onChange={(e) => setSpouse(e.target.value)} />
                </Field>
              </>
            )}
          </div>

          <div className="btn-row pf__foot">
            <button className="btn btn--primary" type="submit">
              <Save size={16} /> Save profile
            </button>
            {!first && (
              <button className="btn btn--ghost" type="button" onClick={() => navigate('/')}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <aside className="card pf__side" aria-label="Profile progress">
          <div className="pf__pct">{pct}%</div>
          <div className="pf__label">profile completed</div>
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <ul className="checks">
            {items.map((i) => (
              <li key={i.key} className={i.done ? 'is-done' : ''}>
                {i.done ? <CircleCheck size={17} /> : <Circle size={17} />}
                {i.label}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
