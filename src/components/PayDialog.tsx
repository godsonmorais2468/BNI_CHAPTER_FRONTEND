import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CircleCheck, X } from 'lucide-react'
import { totalOf } from '../lib/dues'
import { inr } from '../lib/format'
import { payInvoices, useDB } from '../lib/store'
import type { Invoice, PayMethod } from '../lib/types'
import { UPI_ANY, UPI_APPS, isMobile, upiQuery } from '../lib/upi'
import UpiLogo from './UpiLogo'
import type { UpiApp } from '../lib/upi'

const METHOD: PayMethod = 'UPI'

type Phase = 'choose' | 'upi' | 'done'

/** Prototype checkout: UPI only. Pick an app, pay there, confirm here to get a receipt. */
export default function PayDialog({ invoices, memberId, onClose }: { invoices: Invoice[]; memberId: string; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('choose')
  const [receipt, setReceipt] = useState('')
  const [error, setError] = useState('')
  const [app, setApp] = useState<UpiApp | null>(null)
  const db = useDB()
  const total = totalOf(invoices)
  const chapterId = db.members.find((m) => m.id === memberId)?.chapterId
  const chapter = db.chapters.find((c) => c.id === chapterId)
  const upiId = chapter?.upiId ?? ''
  const payee = chapter?.upiName || chapter?.name || 'BNI Chapter'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function settle() {
    const res = payInvoices(memberId, invoices.map((i) => i.id), METHOD)
    if (res.error) {
      setError(res.error)
      return
    }
    setReceipt(res.id ?? '')
    setPhase('done')
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
          <h2>{phase === 'done' ? 'Payment successful' : phase === 'upi' ? `Pay with ${app?.name ?? 'UPI'}` : 'Pay with UPI'}</h2>
          <button type="button" className="scan__x" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {phase === 'done' ? (
          <div className="pay__done">
            <span className="pay__tick">
              <CircleCheck size={44} />
            </span>
            <b>{inr(total)} paid</b>
            <span>
              Receipt <strong>{receipt}</strong> · {METHOD}
            </span>
            <button className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : phase === 'upi' ? (
          <div className="upi__wait">
            <UpiLogo id={app?.id ?? 'any'} size={64} />
            <b>{inr(total)}</b>
            <span>
              to <strong>{payee}</strong>
              <br />
              <small>{upiId}</small>
            </span>
            <p>{isMobile() ? `${app?.name} should open with this amount and receiver filled in. Pay there, then come back and confirm.` : 'UPI apps open on a phone. Open this page on your phone to pay, or confirm below to see the demo receipt.'}</p>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn--primary" onClick={settle}>
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

            {upiId ? (
              <p className="upi__to">
                Paying <strong>{payee}</strong> · {upiId}
              </p>
            ) : (
              <div className="form-error">This chapter has not set a UPI ID yet. Ask your region admin to add it.</div>
            )}
            <div className="upi__apps" role="group" aria-label="Choose a UPI app">
              {[...UPI_APPS, UPI_ANY].map((a) => (
                <button key={a.id} type="button" className="upi__app" onClick={() => openApp(a)} disabled={!upiId}>
                  <UpiLogo id={a.id} />
                  <span>{a.name}</span>
                </button>
              ))}
            </div>
            <p className="pay__note">Tap an app to open it with {inr(total)} and the receiver filled in. Other UPI app lists every UPI app on your phone.</p>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
