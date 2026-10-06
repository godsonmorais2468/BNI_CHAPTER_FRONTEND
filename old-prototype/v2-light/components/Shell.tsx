import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { HOME, NAV } from '../data/nav'
import { useAuth } from '../lib/auth'
import { useDismiss } from '../lib/hooks'
import { percent } from '../lib/profile'
import { signOut } from '../lib/store'
import Backdrop from './Backdrop'
import { Avatar, BniMark, Icon3D } from './ui'

export default function Shell() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(menuRef, open, close)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (!auth.role) return null
  const nav = NAV[auth.role]
  const { member } = auth
  const pct = member ? percent(member) : 0

  return (
    <>
      <Backdrop />
      <div className="app">
        <header className="mast">
          <div className="mast__in">
            <NavLink to={HOME[auth.role]} className="brand" aria-label="BNI Chapter home">
              <BniMark size={46} />
              <span>
                <span className="brand__app">BNI Chapter</span>
                <span className="brand__sub">{auth.chapter ? `${auth.chapter.name} · ${auth.region?.name ?? ''}` : auth.role === 'super_admin' ? 'Super Admin' : auth.region?.name}</span>
              </span>
            </NavLink>

            <nav className="nav" aria-label="Main">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end}>
                  <n.icon size={17} />
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <div className="tools">
              <div className="me" ref={menuRef}>
                <button className="me__btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={member ? `My account, profile ${pct}% complete` : 'My account'}>
                  {member ? (
                    <span className="me__stack">
                      <Avatar name={member.name} photo={member.photo} size={42} />
                      <span className="me__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                        <i style={{ width: `${pct}%` }} />
                      </span>
                      <span className="me__pct">{pct}%</span>
                    </span>
                  ) : (
                    <>
                      <Icon3D icon={UserRound} tone={auth.role === 'super_admin' ? 'navy' : 'gold'} size={42} />
                      <span className="me__text">
                        <span className="me__name">{auth.name}</span>
                        <span className="me__role">{auth.subtitle}</span>
                      </span>
                      <ChevronDown size={15} />
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
          </div>
        </header>

        <main key={location.pathname}>
          <Outlet />
        </main>

        <footer className="footer">
          <span>BNI Chapter · Prototype build</span>
          <span>Givers Gain®</span>
        </footer>

        <nav className="dock" aria-label="Main" style={{ gridTemplateColumns: `repeat(${nav.length}, 1fr)` }}>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <n.icon size={19} />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
