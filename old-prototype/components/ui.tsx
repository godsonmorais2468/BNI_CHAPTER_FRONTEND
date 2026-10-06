import type { ComponentType, CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import logo from '../assets/bni-logo.png'
import type { Tone } from '../data/mock'
import { initials } from '../lib/format'
import { useEscape } from '../lib/hooks'

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
      <img src={logo} alt="BNI" />
    </span>
  )
}

/** Member initials on a glossy tile in their power-team colour. */
export function Avatar({ name, tone, size = 40 }: { name: string; tone: Tone; size?: number }) {
  return (
    <span className={`i3d t-${tone}`} style={sizeVar(size)} aria-hidden>
      <span className="i3d__txt">{initials(name)}</span>
    </span>
  )
}

export function PageHead({
  kicker,
  title,
  lede,
  actions,
  icon,
  tone = 'red',
}: {
  kicker: ReactNode
  title: ReactNode
  lede?: ReactNode
  actions?: ReactNode
  icon?: IconType
  tone?: Tone
}) {
  return (
    <header className="phead">
      <div className="phead__main">
        {icon && <Icon3D icon={icon} tone={tone} size={60} />}
        <div>
          <div className="kicker">{kicker}</div>
          <h1>{title}</h1>
          {lede && <p className="phead__lede">{lede}</p>}
        </div>
      </div>
      {actions && <div className="phead__actions">{actions}</div>}
    </header>
  )
}

/** Tiny bar sparkline; the last bar is the current week. */
export function Spark({ data }: { data: number[] }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  return (
    <span className="spark" aria-hidden>
      {data.map((v, i) => (
        <i key={i} style={{ height: `${25 + ((v - min) / (max - min || 1)) * 75}%` }} />
      ))}
    </span>
  )
}

export function Temp({ level }: { level: number }) {
  return (
    <span className="temp" title={['Cold', 'Warm', 'Hot'][level - 1]}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= level ? 'on' : ''} />
      ))}
    </span>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export function Drawer({ title, onClose, children }: { title: ReactNode; onClose: () => void; children: ReactNode }) {
  useEscape(onClose)
  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer__head">
          <div className="kicker">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </aside>
    </>,
    document.body,
  )
}

export function Modal({
  kicker,
  onClose,
  children,
  footer,
}: {
  kicker: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEscape(onClose)
  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__head">
          <div className="kicker">{kicker}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        {children}
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </>,
    document.body,
  )
}
