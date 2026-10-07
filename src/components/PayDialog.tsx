import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CircleCheck, CreditCard, Landmark, LoaderCircle, Smartphone, X } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { totalOf } from '../lib/dues'
import { inr } from '../lib/format'
import { payInvoices, useDB } from '../lib/store'
import type { Invoice, PayMethod } from '../lib/types'
import { UPI_ANY, UPI_APPS, isMobile, upiQuery } from '../lib/upi'
import type { UpiApp } from '../lib/upi'

const METHODS: { id: PayMethod; hint: string; icon: ComponentType<LucideProps> }[] = [
  { id: 'UPI', hint: 'Pay with any UPI app', icon: Smartphone },
  { id: 'Card', hint: 'Debit or credit card', icon: CreditCard },
  { id: 'Net banking', hint: 'Pay from your bank account', icon: Landmark },
]

type Phase = 'choose' | 'processing' | 'upi' | 'done'

/** Prototype checkout: pick a method, wait a moment, get a receipt. Nothing is charged. */
export default function PayDialog({ invoices, memberId, onClose }: { invoices: Invoice[]; memberId: string; onClose: () => void }) {
  const [method, setMethod] = useState<PayMethod>('UPI')
  const [phase, setPhase] = useState<Phase>('choose')
  const [receipt, setReceipt] = useState('')
  const [error, setError] = useState('')
  const [app, setApp] = useState<UpiApp | null>(null)
  const db = useDB()
  const timer = useRef<number | undefined>(undefined)
  const total = totalOf(invoices)
  const chapterId = db.members.find((m) => m.id === memberId)?.chapterId
  const chapter = db.chapters.find((c) => c.id === chapterId)
  const upiId = chapter?.upiId ?? ''
  const payee = chapter?.upiName || chapter?.name || 'BNI Chapter'

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && phase !== 'processing' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, phase])

  function settle(onError: () => void) {
    const res = payInvoices(memberId, invoices.map((i) => i.id), method)
    if (res.error) {
      setError(res.error)
      onError()
      return
    }
    setReceipt(res.id ?? '')
    setPhase('done')
  }

  function pay() {
    setError('')
    setPhase('processing')
    timer.current = window.setTimeout(() => settle(() => setPhase('choose')), 1200)
  }

  /** Opens the chosen UPI app on the phone with the amount and receiver already filled in. */
  function openApp(chosen: UpiApp) {
    setError('')
    setApp(chosen)
    setPhase('upi')
    if (isMobile()) {
      const note = invoices.length === 1 ? invoices[0].label : `${invoices.length} invoices`
      window.location.assign(chosen.link(upiQuery({ upiId, name: payee, amount: total, note })))
    }
  }

  return createPortal(
    <div className="scan" role="dialog" aria-modal="true" aria-label="Pay dues">
      <div className="scan__card pay">
        <div className="scan__head">
          <h2>{phase === 'done' ? 'Payment successful' : phase === 'upi' ? `Pay with ${app?.name ?? 'UPI'}` : 'Pay dues'}</h2>
          {phase !== 'processing' && (
            <button type="button" className="scan__x" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>

        {phase === 'done' ? (
          <div className="pay__done">
            <span className="pay__tick">
              <CircleCheck size={44} />
            </span>
            <b>{inr(total)} paid</b>
            <span>
              Receipt <strong>{receipt}</strong> · {method}
            </span>
            <button className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : phase === 'upi' ? (
          <div className="upi__wait">
            <span className="upi__tile" style={{ background: app?.colour }}>
              {(app?.name ?? 'U').charAt(0)}
            </span>
            <b>{inr(total)}</b>
            <span>
              to <strong>{payee}</strong>
              <br />
              <small>{upiId}</small>
            </span>
            <p>{isMobile() ? `${app?.name} should open with this amount and receiver filled in. Pay there, then come back and confirm.` : 'UPI apps open on a phone. Open this page on your phone to pay, or confirm below to see the demo receipt.'}</p>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn--primary" onClick={() => settle(() => undefined)}>
              <Check size={17} /> I have paid
            </button>
            <button className="btn btn--line" onClick={() => setPhase('choose')}>
              Choose another app
            </button>
            <p className="pay__note">UPI apps cannot report the result back to this page, so confirm once your app shows success.</p>
          </div>
        ) : (
          <>
            <ul className="pay__items">
              {invoices.map((i) => (
                <li key={i.id}>
                  <span>{i.label}</span>
                  <b>{inr(i.amount)}</b>
                </li>
              ))}
              <li className="pay__total">
                <span>Total</span>
                <b>{inr(total)}</b>
              </li>
            </ul>

            <div className="pay__methods" role="radiogroup" aria-label="Payment method">
              {METHODS.map((m) => (
                <button key={m.id} type="button" role="radio" aria-checked={method === m.id} className={`pay__m ${method === m.id ? 'is-on' : ''}`} onClick={() => setMethod(m.id)} disabled={phase === 'processing'}>
                  <m.icon size={20} />
                  <span>
                    <b>{m.id}</b>
                    <small>{m.hint}</small>
                  </span>
                  <span className="pay__radio">{method === m.id && <Check size={14} />}</span>
                </button>
              ))}
            </div>

            {error && <div className="form-error">{error}</div>}
            {method === 'UPI' ? (
              <>
                {upiId ? (
                  <p className="upi__to">
                    Paying <strong>{payee}</strong> · {upiId}
                  </p>
                ) : (
                  <div className="form-error">This chapter has not set a UPI ID yet. Ask your region admin to add it.</div>
                )}
                <div className="upi__apps" role="group" aria-label="Choose a UPI app">
                  {[...UPI_APPS, UPI_ANY].map((a) => (
                    <button key={a.id} type="button" className="upi__app" onClick={() => openApp(a)} disabled={!upiId || phase === 'processing'}>
                      <span className="upi__tile" style={{ background: a.colour }}>
                        {a.id === 'any' ? <Smartphone size={20} /> : a.name.charAt(0)}
                      </span>
                      <span>{a.name}</span>
                    </button>
                  ))}
                </div>
                <p className="pay__note">Tap an app to open it with {inr(total)} and the receiver filled in. Other UPI app lists every UPI app on your phone.</p>
              </>
            ) : (
              <>
                <button className="btn btn--primary" onClick={pay} disabled={phase === 'processing'}>
                  {phase === 'processing' ? (
                    <>
                      <LoaderCircle size={17} className="spin" /> Processing…
                    </>
                  ) : (
                    <>Pay {inr(total)}</>
                  )}
                </button>
                <p className="pay__note">Prototype: no money is charged.</p>
              </>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
