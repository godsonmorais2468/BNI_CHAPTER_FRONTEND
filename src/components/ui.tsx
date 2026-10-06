import { useId, useState } from 'react'
import type { ComponentType, CSSProperties, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'
import { Camera } from 'lucide-react'
import logo from '../assets/bni-logo.png'
import { initials, toneFor } from '../lib/format'
import { readPhoto } from '../lib/photo'
import type { Tone } from '../lib/types'

type IconType = ComponentType<LucideProps>

const sizeVar = (size: number) => ({ '--size': `${size}px` }) as CSSProperties

/** Glossy 3D icon tile. */
export function Icon3D({ icon: Icon, tone = 'red', size = 44 }: { icon: IconType; tone?: Tone; size?: number }) {
  return (
    <span className={`i3d t-${tone}`} style={sizeVar(size)} aria-hidden>
      <Icon size={Math.round(size * 0.46)} strokeWidth={2.1} />
    </span>
  )
}

/** The BNI logo as a glossy red app tile with white letters. */
export function BniMark({ size = 44 }: { size?: number }) {
  return (
    <span className="i3d t-red bni-mark" style={sizeVar(size)}>
      <img src={logo} alt="BNI" decoding="async" />
    </span>
  )
}

/** A member's photo, or their initials on a glossy tile. */
export function Avatar({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) {
  if (photo) {
    return <img className="avatar-img" src={photo} alt="" decoding="async" loading="lazy" style={{ width: size, height: size, borderRadius: size * 0.3 }} />
  }
  return (
    <span className={`i3d t-${toneFor(name)}`} style={sizeVar(size)} aria-hidden>
      <span className="i3d__txt">{initials(name)}</span>
    </span>
  )
}

export function PageHead({
  eyebrow,
  title,
  subtitle,
  actions,
  icon,
  tone = 'red',
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  icon?: IconType
  tone?: Tone
}) {
  return (
    <header className="phead">
      <div>
        {eyebrow && (
          <div className="phead__chip">
            {icon && <Icon3D icon={icon} tone={tone} size={26} />}
            {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <p className="phead__sub">{subtitle}</p>}
      </div>
      {actions && <div className="phead__actions">{actions}</div>}
    </header>
  )
}

/** A frosted glass sheet with a heading. */
export function Sheet({ icon, tone = 'red', title, note, children }: { icon?: IconType; tone?: Tone; title: ReactNode; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="sheet">
      <div className="sheet__head">
        {icon && <Icon3D icon={icon} tone={tone} size={40} />}
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export interface StripItem {
  icon: IconType
  tone: Tone
  label: string
  value: ReactNode
}

/** One glass capsule holding a few headline numbers. */
export function StatStrip({ items }: { items: StripItem[] }) {
  return (
    <div className="strip">
      {items.map((i) => (
        <div className="strip__item" key={i.label}>
          <Icon3D icon={i.icon} tone={i.tone} size={46} />
          <div>
            <div className="strip__label">{i.label}</div>
            <div className="strip__value">{i.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Circular progress. */
export function Ring({ pct, size = 150, label }: { pct: number; size?: number; label?: string }) {
  const id = useId()
  const stroke = 11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF6C93" />
            <stop offset="1" stopColor="#D4003F" />
          </linearGradient>
        </defs>
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring__arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="ring__text">
        <div className="ring__n">{pct}%</div>
        {label && <div className="ring__l">{label}</div>}
      </div>
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

/* ---------- form pieces ---------- */

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className={`field ${error ? 'field--invalid' : ''}`}>
      <span className="field__label">
        {label}
        {required && <span className="req">*</span>}
      </span>
      {hint && <span className="field__hint">{hint}</span>}
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

/** Like Field, for a group of buttons rather than one input. */
export function FieldGroup({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`} role="group" aria-label={label}>
      <span className="field__label">
        {label}
        {required && <span className="req">*</span>}
      </span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

/** 4-digit PIN with the "Show Password" checkbox used in LTRT. */
export function PinField({
  label = 'Password',
  value,
  onChange,
  error,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const [show, setShow] = useState(false)
  const id = useId()
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        <span className="req">*</span>
      </label>
      <span className="field__hint">Password must be a 4-digit number</span>
      <input
        id={id}
        className="field__control"
        type={show ? 'text' : 'password'}
        inputMode="numeric"
        autoComplete="new-password"
        placeholder="Enter a new 4-digit pin"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
      />
      <label className="check">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show Password
      </label>
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

/** Photo picker (max 1 MB). Stores a small data URL. */
export function PhotoField({ label = 'Photo (Max Size 1MB)', value, onChange }: { label?: string; value: string; onChange: (dataUrl: string) => void }) {
  const [error, setError] = useState('')
  const [name, setName] = useState('')

  async function pick(file: File | undefined) {
    if (!file) return
    try {
      const url = await readPhoto(file)
      setError('')
      setName(file.name)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That image could not be read.')
    }
  }

  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <span className="field__label">{label}</span>
      <label className="filebox">
        <span className="filebox__btn">
          <Camera size={15} /> Choose File
        </span>
        {value && <img className="filebox__thumb" src={value} alt="Selected photo" />}
        <span className="filebox__name">{name || (value ? 'Current photo' : 'No file chosen')}</span>
        <input type="file" accept="image/*" onChange={(e) => void pick(e.target.files?.[0])} />
      </label>
      {value && (
        <button
          type="button"
          className="link-btn"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            setName('')
            onChange('')
          }}
        >
          Remove photo
        </button>
      )}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
