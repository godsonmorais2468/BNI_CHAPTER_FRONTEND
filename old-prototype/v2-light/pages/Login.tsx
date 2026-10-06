import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import { BniMark, Toggle } from '../components/ui'
import { HOME } from '../data/nav'
import { useAuth } from '../lib/auth'
import type { AuthInfo } from '../lib/auth'
import { resetDemo, signIn } from '../lib/store'
import { useToast } from '../lib/toast'

const DEMO = [
  { label: 'Super Admin', mobile: '9000000001', pin: '1111' },
  { label: 'Region Admin', mobile: '9000000002', pin: '2222' },
  { label: 'Member', mobile: '9846010001', pin: '1234' },
]

/** First sign-in goes to the profile page (it can be skipped there); everyone else to their own home. */
function landing(auth: AuthInfo) {
  if (auth.role === 'member' && auth.member?.profileState === 'pending') return '/profile'
  return auth.role ? HOME[auth.role] : '/login'
}

function LoginBackdrop() {
  return (
    <div className="login__bg" aria-hidden>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="lg-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EFE6E9" />
          </linearGradient>
          <radialGradient id="lg-red" cx="0.72" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#FF2E62" />
            <stop offset="0.3" stopColor="#D4003F" />
            <stop offset="0.75" stopColor="#8A0024" />
            <stop offset="1" stopColor="#4A000F" />
          </radialGradient>
          <linearGradient id="lg-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF3F6C" />
            <stop offset="0.45" stopColor="#D4003F" />
            <stop offset="1" stopColor="#6E0019" />
          </linearGradient>
          <filter id="lg-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#lg-base)" />
        <ellipse cx="1180" cy="300" rx="260" ry="360" fill="#fff" opacity="0.9" filter="url(#lg-blur)" />

        <circle cx="-260" cy="430" r="980" fill="url(#lg-red)" />
        <circle cx="-260" cy="430" r="900" fill="none" stroke="url(#lg-sheen)" strokeWidth="60" />
        <circle cx="-260" cy="430" r="968" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
        <circle cx="-260" cy="430" r="760" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" />

        <circle cx="1530" cy="1060" r="360" fill="none" stroke="url(#lg-ring)" strokeWidth="96" />
        <circle cx="1530" cy="1060" r="404" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="260 2300" strokeDashoffset="-1650" />
      </svg>
    </div>
  )
}

export default function Login() {
  const auth = useAuth()
  const toast = useToast()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const pinRefs = useRef<(HTMLInputElement | null)[]>([])

  if (auth.role) return <Navigate to={landing(auth)} replace />

  function setDigit(i: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length > 1) {
      /* pasted the whole PIN */
      const next = digits.slice(0, 4).split('')
      setPin([0, 1, 2, 3].map((k) => next[k] ?? ''))
      pinRefs.current[Math.min(next.length, 4) - 1]?.focus()
      return
    }
    setPin((p) => p.map((d, k) => (k === i ? digits : d)))
    if (digits && i < 3) pinRefs.current[i + 1]?.focus()
  }

  function fill(d: (typeof DEMO)[number]) {
    setPhone(d.mobile)
    setPin(d.pin.split(''))
    setError('')
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (phone.length !== 10) return setError('Enter your 10-digit mobile number.')
    if (pin.some((d) => !d)) return setError('Enter all four digits of your PIN.')
    if (!signIn(phone, pin.join(''), remember)) return setError('Mobile number or PIN is incorrect.')
    setError('')
  }

  return (
    <div className="login">
      <LoginBackdrop />

      <section className="login__art">
        <BniMark size={96} />
        <h2 className="login__big">BNI Chapter</h2>
        <p className="login__tag">Login Panel</p>
        <p className="login__lede">Business networking made simple. Connect, collaborate and grow with your chapter.</p>
      </section>

      <section className="login__card">
        <div className="login__head">
          <BniMark size={64} />
          <div>
            <h1>BNI Chapter</h1>
            <p>Login Panel</p>
          </div>
        </div>

        <form className="login__form" onSubmit={submit} noValidate>
          <label className="pill-field">
            <Phone size={18} />
            <span className="pill-field__prefix">+91</span>
            <input
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Mobile number"
              aria-label="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              autoFocus
            />
          </label>

          <div className="field">
            <span className="field__label" id="pin-label">
              4-digit PIN
            </span>
            <div className="pin" role="group" aria-labelledby="pin-label">
              {pin.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    pinRefs.current[i] = el
                  }}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={`PIN digit ${i + 1}`}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !d && i > 0) pinRefs.current[i - 1]?.focus()
                  }}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
          </div>

          <div className="login__row">
            <span>Remember me</span>
            <Toggle checked={remember} onChange={setRemember} label="Remember me" />
          </div>

          {error && (
            <div className="form-error" role="alert">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button className="btn btn--primary btn--block login__submit" type="submit">
            <ShieldCheck size={19} /> Login Now <ArrowRight size={17} />
          </button>

          <div className="login__links">
            <button type="button" className="link-btn" onClick={() => toast('PIN reset is not part of this prototype', 'info')}>
              Forgot PIN?
            </button>
            <Link className="link-btn" to="/register">
              New member? Register
            </Link>
          </div>
        </form>

        <div className="demo">
          <div className="demo__title">Prototype — try a demo login</div>
          <div className="demo__row">
            {DEMO.map((d) => (
              <button key={d.label} type="button" className="btn btn--line btn--sm" onClick={() => fill(d)}>
                {d.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="link-btn demo__reset"
            onClick={() => {
              resetDemo()
              toast('Demo data reset', 'info')
            }}
          >
            Reset demo data
          </button>
        </div>
      </section>
    </div>
  )
}
