import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { HOME, NAV } from '../data/nav'
import { useAuth } from '../lib/auth'
import { useDismiss } from '../lib/hooks'
import { useNotifications } from '../lib/notifications'
import { percent } from '../lib/profile'
import { signOut, useDB } from '../lib/store'
import Backdrop from './Backdrop'
import NotificationBell from './NotificationBell'
import { Avatar, BniMark, Icon3D } from './ui'

export default function Shell() {
  const auth = useAuth()
  const db = useDB()
  const notes = useNotifications(auth.member)
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(menuRef, open, close)
  const dockRef = useRef<HTMLElement>(null)
  /* On phones the dock shows only icons; touching one pops up its name. */
  const [tip, setTip] = useState<{ label: string; x: number } | null>(null)
  const tipTimer = useRef<number | undefined>(undefined)
  const showTip = (el: HTMLElement, label: string) => {
    window.clearTimeout(tipTimer.current)
    const r = el.getBoundingClientRect()
    setTip({ label, x: Math.min(Math.max(r.left + r.width / 2, 48), window.innerWidth - 48) })
    /* the bubble stays for two seconds from the press */
    tipTimer.current = window.setTimeout(() => setTip(null), 2000)
  }
  useEffect(() => () => window.clearTimeout(tipTimer.current), [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!auth.role) return null
  const nav = NAV[auth.role]
  const { member } = auth
  const pct = member ? percent(member) : 0
  const dueCount = member ? db.invoices.filter((i) => i.memberId === member.id && i.status === 'due').length : 0
  const sub = auth.chapter ? `${auth.chapter.name} · ${auth.region?.name ?? ''}` : auth.role === 'super_admin' ? 'Super Admin' : (auth.region?.name ?? '')

  return (
    <>
      <Backdrop />
      <div className="app">
        <header className="top">
          <NavLink to={HOME[auth.role]} className="brand" aria-label="BNI Chapter home">
            <BniMark size={42} />
            <span>
              <span className="brand__app">BNI Chapter</span>
              <span className="brand__sub">{sub}</span>
            </span>
          </NavLink>

          <div className="top__right">
            {member && <NotificationBell notes={notes} memberId={member.id} />}
          <div className="me" ref={menuRef}>
            <button
              className={`me__btn ${member ? 'me__btn--member' : ''}`}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={member ? `My account, profile ${pct}% complete` : 'My account'}
            >
              {member ? (
                <span className="me__stack">
                  <Avatar name={member.name} photo={member.photo} size={44} />
                  <span className="me__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <i style={{ width: `${pct}%` }} />
                  </span>
                  <span className="me__pct">{pct}%</span>
                </span>
              ) : (
                <>
                  <Icon3D icon={UserRound} tone={auth.role === 'super_admin' ? 'wine' : 'gold'} size={42} />
                  <span className="me__text">
                    <span className="me__name">{auth.name}</span>
                    <span className="me__role">{auth.subtitle}</span>
                  </span>
                </>
              )}
            </button>

            {open && (
              <div className="pop">
                <div className="pop__head">
                  <Avatar name={auth.name} photo={member?.photo} size={42} />
                  <div>
                    <div className="pop__name">{auth.name}</div>
                    <div className="pop__sub">{auth.subtitle}</div>
                  </div>
                </div>
                {member && (
                  <>
                    <div className="pop__pct">
                      <span>Profile completed</span>
                      <b>{pct}%</b>
                    </div>
                    <button
                      className="menu-item"
                      onClick={() => {
                        setOpen(false)
                        navigate('/profile')
                      }}
                    >
                      <UserRound size={16} /> My profile
                    </button>
                  </>
                )}
                <button
                  className="menu-item"
                  onClick={() => {
                    signOut()
                    navigate('/login')
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
          </div>
        </header>

        <main key={location.pathname}>
          <Outlet />
        </main>

        <nav className="dock" aria-label="Main" ref={dockRef}>
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onPointerDown={(e) => showTip(e.currentTarget, n.label)}
            >
              <span className="dock__ico">
                <Icon3D icon={n.icon} tone={n.tone} size={52} />
                {n.badge === 'dues' && dueCount > 0 && (
                  <b className="dock__badge" aria-label={`${dueCount} pending ${dueCount === 1 ? 'due' : 'dues'}`}>
                    {dueCount}
                  </b>
                )}
              </span>
              <span className="dock__label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        {tip && (
          <div className="dock__tip" style={{ left: tip.x }} role="status">
            {tip.label}
          </div>
        )}
      </div>
    </>
  )
}
