import { useState } from 'react'
import { CircleCheck, History, IndianRupee, Receipt } from 'lucide-react'
import PayDialog from '../../components/PayDialog'
import { Icon3D, PageHead } from '../../components/ui'
import { isOverdue, totalOf } from '../../lib/dues'
import { useAuth } from '../../lib/auth'
import { fmtDate, inr } from '../../lib/format'
import { useNow } from '../../lib/hooks'
import { useDB } from '../../lib/store'
import type { Invoice } from '../../lib/types'

type Tab = 'dues' | 'history'

export default function Dues() {
  const { member } = useAuth()
  const db = useDB()
  const now = useNow(60_000)
  const [tab, setTab] = useState<Tab>('dues')
  const [paying, setPaying] = useState<Invoice[] | null>(null)

  if (!member) return null

  const mine = db.invoices.filter((i) => i.memberId === member.id)
  const due = mine.filter((i) => i.status === 'due').sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const history = mine.filter((i) => i.status === 'paid').sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''))
  const overdue = due.filter((i) => isOverdue(i, now))

  return (
    <div className="page">
      <PageHead eyebrow="Payments" icon={IndianRupee} tone="gold" title="Dues" subtitle="What you owe your chapter, and everything you have paid so far." />

      <div className="seg dues__tabs" role="tablist" aria-label="Dues and payment history">
        <button type="button" role="tab" aria-selected={tab === 'dues'} aria-pressed={tab === 'dues'} onClick={() => setTab('dues')}>
          Dues{due.length > 0 && <span className="dues__n">{due.length}</span>}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'history'} aria-pressed={tab === 'history'} onClick={() => setTab('history')}>
          Payment history
        </button>
      </div>

      {tab === 'dues' ? (
        <div className="att">
          {due.length === 0 ? (
            <section className="state state--ok">
              <Icon3D icon={CircleCheck} tone="green" size={64} />
              <div>
                <h2>You are all paid up</h2>
                <p>{history[0] ? `Last payment of ${inr(history[0].amount)} on ${fmtDate(history[0].paidAt ?? '')}.` : 'You have no pending dues.'}</p>
              </div>
              {history.length > 0 && (
                <button className="btn btn--line" onClick={() => setTab('history')}>
                  <History size={16} /> Payment history
                </button>
              )}
            </section>
          ) : (
            <>
              <section className="dues__sum">
                <div>
                  <span className="dues__label">Total due</span>
                  <b className="dues__total">{inr(totalOf(due))}</b>
                  <span className="dues__sub">
                    {due.length} pending {due.length === 1 ? 'invoice' : 'invoices'}
                    {overdue.length > 0 && ` · ${overdue.length} overdue`}
                  </span>
                </div>
                <button className="btn btn--primary" onClick={() => setPaying(due)}>
                  <IndianRupee size={16} /> {due.length > 1 ? 'Pay all' : 'Pay now'}
                </button>
              </section>

              <ul className="inv">
                {due.map((i) => {
                  const late = isOverdue(i, now)
                  return (
                    <li key={i.id} className={`inv__row ${late ? 'is-late' : ''}`}>
                      <Icon3D icon={Receipt} tone={late ? 'red' : 'gold'} size={50} />
                      <div className="inv__main">
                        <b>{i.label}</b>
                        <span>Due {fmtDate(i.dueDate)}</span>
                      </div>
                      <span className={`stat ${late ? 'stat--bad' : 'stat--idle'}`}>{late ? 'Overdue' : 'Due'}</span>
                      <b className="inv__amt">{inr(i.amount)}</b>
                      <button className="btn btn--primary btn--sm" onClick={() => setPaying([i])}>
                        Pay
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div className="att">
          <section className="dues__sum dues__sum--calm">
            <div>
              <span className="dues__label">Total paid</span>
              <b className="dues__total">{inr(totalOf(history))}</b>
              <span className="dues__sub">
                {history.length} {history.length === 1 ? 'payment' : 'payments'}
              </span>
            </div>
          </section>

          {history.length === 0 ? (
            <div className="empty">
              <b>No payments yet.</b>
              Your payments will be listed here.
            </div>
          ) : (
            <ul className="inv">
              {history.map((i) => (
                <li key={i.id} className="inv__row">
                  <Icon3D icon={Receipt} tone="green" size={50} />
                  <div className="inv__main">
                    <b>{i.label}</b>
                    <span>
                      Paid {fmtDate(i.paidAt ?? '')} · {i.method} · {i.ref}
                    </span>
                  </div>
                  <span className="stat stat--ok">Paid</span>
                  <b className="inv__amt">{inr(i.amount)}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {paying && <PayDialog invoices={paying} memberId={member.id} onClose={() => setPaying(null)} />}
    </div>
  )
}
