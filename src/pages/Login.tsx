import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react'
import Backdrop from '../components/Backdrop'
import { BniMark, Toggle } from '../components/ui'
import { HOME } from '../data/nav'
import { useAuth } from '../lib/auth'
import type { AuthInfo } from '../lib/auth'
import { clearRead } from '../lib/notifications'
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

export default function Login() {
  const auth = useAuth()
  const toast = useToast()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [remember, setRemember] = useState(true)
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
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    /* Prototype: no checks. Unknown or empty details sign in as the demo member. */
    if (!signIn(phone, pin.join(''), remember)) signIn(DEMO[2].mobile, DEMO[2].pin, remember)
  }

  return (
    <>
      <Backdrop />
      <div className="login">
        <section className="login__card">
          <div className="login__top">
            <BniMark size={76} />
            <h1>BNI Chapter</h1>
            <p>Login Panel</p>
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
              <button
                type="button"
                className="link-btn demo__reset"
                onClick={() => {
                  resetDemo()
                  clearRead()
                  toast('Demo data reset', 'info')
                }}
              >
                Reset demo data
              </button>
            </div>
          </div>
        </section>

        <p className="login__tag">
          <b>Connect.</b> <b>Collaborate.</b> <b>Grow.</b>
        </p>
      </div>
    </>
  )
}
