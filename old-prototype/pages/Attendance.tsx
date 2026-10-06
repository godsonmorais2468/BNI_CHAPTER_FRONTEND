import { useState } from 'react'
import { CalendarCheck, Download, Save } from 'lucide-react'
import { Avatar, PageHead } from '../components/ui'
import { MEETING_DATES, MEMBERS, PALMS_META, TEAMS } from '../data/mock'
import type { Palms } from '../data/mock'
import { fmtDate } from '../lib/format'
import { useToast } from '../lib/toast'

const ORDER: Palms[] = ['P', 'A', 'L', 'M', 'S']
const LATEST = MEETING_DATES.length - 1
const LOW = 75

/* Present, late and substituted all count as the seat being covered. */
const covered = (p: Palms) => p === 'P' || p === 'L' || p === 'S'

export default function Attendance() {
  const toast = useToast()
  const [grid, setGrid] = useState<Record<string, Palms[]>>(() =>
    Object.fromEntries(MEMBERS.map((m) => [m.id, [...m.palms]])),
  )
  const [onlyGaps, setOnlyGaps] = useState(false)

  function cycle(id: string, col: number) {
    setGrid((g) => {
      const row = [...g[id]]
      row[col] = ORDER[(ORDER.indexOf(row[col]) + 1) % ORDER.length]
      return { ...g, [id]: row }
    })
  }

  const latest = MEMBERS.map((m) => grid[m.id][LATEST])
  const counts = Object.fromEntries(ORDER.map((p) => [p, latest.filter((x) => x === p).length])) as Record<Palms, number>
  const rate = Math.round((latest.filter(covered).length / MEMBERS.length) * 100)
  const pctFor = (id: string) => Math.round((grid[id].filter(covered).length / MEETING_DATES.length) * 100)
  const rows = onlyGaps ? MEMBERS.filter((m) => grid[m.id].some((p) => !covered(p) || p === 'L')) : MEMBERS

  function exportCsv() {
    const head = ['Member', 'Category', ...MEETING_DATES.map((d) => fmtDate(d, { day: '2-digit', month: 'short' })), 'Attendance %']
    const body = MEMBERS.map((m) => [m.name, m.category, ...grid[m.id], `${pctFor(m.id)}%`])
    const csv = [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'palms-attendance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <PageHead
        icon={CalendarCheck}
        tone="green"
        kicker={`PALMS · last ${MEETING_DATES.length} meetings`}
        title={
          <>
            Present &amp; <em>accounted.</em>
          </>
        }
        lede="Click any cell to cycle Present → Absent → Late → Medical → Substitute. The highlighted column is the most recent meeting."
        actions={
          <>
            <button className="btn btn--line" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn btn--primary" onClick={() => toast('PALMS sheet saved')}>
              <Save size={16} /> Save sheet
            </button>
          </>
        }
      />

      <div className="palms-sum">
        {ORDER.map((p) => (
          <div key={p}>
            <span>
              <i className={`pcell-dot pcell--${p}`} />
              {PALMS_META[p].long}
            </span>
            <b>{counts[p]}</b>
          </div>
        ))}
        <div>
          <span>{fmtDate(MEETING_DATES[LATEST], { day: 'numeric', month: 'short' })} coverage</span>
          <b>{rate}%</b>
        </div>
      </div>

      <div className="toolbar">
        <div className="seg" role="group" aria-label="Rows">
          <button aria-pressed={!onlyGaps} onClick={() => setOnlyGaps(false)}>
            Everyone
          </button>
          <button aria-pressed={onlyGaps} onClick={() => setOnlyGaps(true)}>
            Only gaps
          </button>
        </div>
        <span className="toolbar__spacer" />
        <div className="legend-row" style={{ marginTop: 0 }}>
          {ORDER.map((p) => (
            <span key={p}>
              <i className={`pcell-dot pcell--${p}`} /> {p} · {PALMS_META[p].long}
            </span>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="sticky-col">Member</th>
              {MEETING_DATES.map((d, i) => (
                <th key={i} className={`c ${i === LATEST ? 'is-latest' : ''}`}>
                  {fmtDate(d, { day: '2-digit', month: 'short' })}
                </th>
              ))}
              <th className="r">Attended</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const pct = pctFor(m.id)
              return (
                <tr key={m.id}>
                  <td className="sticky-col">
                    <div className="who">
                      <Avatar name={m.name} tone={TEAMS[m.team].tone} size={32} />
                      <div>
                        <div className="who__name">{m.name}</div>
                        <div className="who__sub">{m.category}</div>
                      </div>
                    </div>
                  </td>
                  {grid[m.id].map((p, i) => (
                    <td key={i} className={`c ${i === LATEST ? 'is-latest' : ''}`} style={{ padding: '8px 6px' }}>
                      <button
                        className={`pcell pcell--${p}`}
                        onClick={() => cycle(m.id, i)}
                        title={`${m.name} · ${fmtDate(MEETING_DATES[i], { day: 'numeric', month: 'short' })}: ${PALMS_META[p].long}`}
                      >
                        {p}
                      </button>
                    </td>
                  ))}
                  <td>
                    <div className={`pct ${pct < LOW ? 'is-low' : ''}`}>
                      <span className="pct__bar">
                        <i style={{ width: `${pct}%` }} />
                      </span>
                      <b>{pct}%</b>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="sticky-col">Seats covered</td>
              {MEETING_DATES.map((_, i) => (
                <td key={i} className={`c ${i === LATEST ? 'is-latest' : ''}`}>
                  {MEMBERS.filter((m) => covered(grid[m.id][i])).length}/{MEMBERS.length}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
