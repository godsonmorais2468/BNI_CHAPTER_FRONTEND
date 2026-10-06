import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, KeyRound, LogOut, Search, UserRound } from 'lucide-react'
import { NAV } from '../data/nav'
import { CHAPTER, MEMBERS, NEXT_MEETING, TEAMS, TODAY } from '../data/mock'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { fmtDate, isoWeek } from '../lib/format'
import Backdrop from './Backdrop'
import CommandPalette from './CommandPalette'
import { Avatar, BniMark } from './ui'

export default function Shell() {
  const { user, signOut } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [palette, setPalette] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const me = MEMBERS.find((m) => m.id === user?.memberId) ?? MEMBERS[0]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!menu) return
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menu])

  return (
    <>
      <Backdrop />
      <div className="app">
      <div className="topline">
        <div className="topline__in">
          <span className="topline__live">
            <span className="pulse" />
            <span className="topline__date">
              {fmtDate(TODAY, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
            </span>
            <strong>Week {isoWeek(TODAY)}</strong>
          </span>
          <span className="topline__meet">
            Next meeting <strong>{fmtDate(NEXT_MEETING, { weekday: 'short', day: 'numeric', month: 'short' })}, 07:00</strong> ·{' '}
            {CHAPTER.venue}
          </span>
        </div>
      </div>

      <header className="mast">
        <div className="mast__in">
          <NavLink to="/" className="brand" aria-label="BNI Chapter home">
            <BniMark size={46} />
            <span>
              <span className="brand__app">CHAPTER</span>
              <span className="brand__chapter">
                {CHAPTER.name} · {CHAPTER.city}
              </span>
            </span>
          </NavLink>

          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}>
                <span className="num">{n.num}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="tools">
            <button className="search-btn" onClick={() => setPalette(true)} aria-label="Search">
              <Search size={16} />
              <span>Search members…</span>
              <span className="kbd">Ctrl K</span>
            </button>

            <div className="usermenu" ref={menuRef}>
              <button className="usermenu__btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                <Avatar name={me.name} tone={TEAMS[me.team].tone} size={38} />
                <span className="usermenu__text">
                  <span className="usermenu__name">{me.name}</span>
                  <span className="usermenu__role">{user?.role}</span>
                </span>
                <ChevronDown size={15} className="usermenu__text" />
              </button>
              {menu && (
                <div className="usermenu__pop">
                  <div className="usermenu__head">
                    <Avatar name={me.name} tone={TEAMS[me.team].tone} size={40} />
                    <div>
                      <div className="usermenu__name">{me.name}</div>
                      <div className="usermenu__role">{me.business}</div>
                    </div>
                  </div>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setMenu(false)
                      navigate(`/members?m=${me.id}`)
                    }}
                  >
                    <UserRound size={16} /> My profile
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setMenu(false)
                      toast('Change MPIN is not part of this prototype', 'info')
                    }}
                  >
                    <KeyRound size={16} /> Change MPIN
                  </button>
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
        <span>BNI Chapter · {CHAPTER.name}, {CHAPTER.region} · Est. {CHAPTER.founded}</span>
        <span>Givers Gain® · Prototype build</span>
      </footer>

      <nav className="dock" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}>
            <n.icon size={19} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      </div>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </>
  )
}
