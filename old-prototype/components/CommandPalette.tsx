import { useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { NAV } from '../data/nav'
import { MEMBERS, TEAMS } from '../data/mock'
import { useEscape } from '../lib/hooks'
import { Avatar, Icon3D } from './ui'

interface Item {
  key: string
  label: string
  hint: string
  to: string
  render: () => ReactNode
}

const ALL: Item[] = [
  ...NAV.map((n) => ({
    key: n.to,
    label: n.label,
    hint: `Page ${n.num}`,
    to: n.to,
    render: () => <Icon3D icon={n.icon} tone="navy" size={30} />,
  })),
  ...MEMBERS.map((m) => ({
    key: m.id,
    label: m.name,
    hint: m.category,
    to: `/members?m=${m.id}`,
    render: () => <Avatar name={m.name} tone={TEAMS[m.team].tone} size={30} />,
  })),
]

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  useEscape(onClose)

  const needle = q.trim().toLowerCase()
  const items = (
    needle ? ALL.filter((i) => i.label.toLowerCase().includes(needle) || i.hint.toLowerCase().includes(needle)) : ALL
  ).slice(0, 8)

  function go(item: Item | undefined) {
    if (!item) return
    navigate(item.to)
    onClose()
  }

  return createPortal(
    <>
      <div className="scrim" style={{ zIndex: 70 }} onClick={onClose} />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Jump to">
        <div className="palette__input">
          <Search size={18} />
          <input
            autoFocus
            value={q}
            placeholder="Jump to a page or member…"
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, items.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter') {
                go(items[active])
              }
            }}
          />
          <span className="kbd">Esc</span>
        </div>
        <div className="palette__list">
          {items.length === 0 && <div className="palette__empty">Nothing matches “{q}”.</div>}
          {items.map((item, i) => (
            <button
              key={item.key}
              className={`palette__item ${i === active ? 'is-on' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
            >
              {item.render()}
              <span className="palette__label">{item.label}</span>
              <span className="palette__hint">{item.hint}</span>
              <ArrowRight size={15} className="palette__go" />
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body,
  )
}
