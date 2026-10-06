import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, CircleCheck, CreditCard, Landmark, LoaderCircle, Smartphone, X } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { totalOf } from '../lib/dues'
import { inr } from '../lib/format'
import { payInvoices } from '../lib/store'
import type { Invoice, PayMethod } from '../lib/types'

const METHODS: { id: PayMethod; hint: string; icon: ComponentType<LucideProps> }[] = [
  { id: 'UPI', hint: 'Pay with any UPI app', icon: Smartphone },
  { id: 'Card', hint: 'Debit or credit card', icon: CreditCard },
  { id: 'Net banking', hint: 'Pay from your bank account', icon: Landmark },
]

type Phase = 'choose' | 'processing' | 'done'

/** Prototype checkout: pick a method, wait a moment, get a receipt. Nothing is charged. */
export default function PayDialog({ invoices, memberId, onClose }: { invoices: Invoice[]; memberId: string; onClose: () => void }) {
  const [method, setMethod] = useState<PayMethod>('UPI')
  const [phase, setPhase] = useState<Phase>('choose')
  const [receipt, setReceipt] = useState('')
  const [error, setError] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const total = totalOf(invoices)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && phase !== 'processing' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, phase])

  function pay() {
    setError('')
    setPhase('processing')
    timer.current = window.setTimeout(() => {
      const res = payInvoices(memberId, invoices.map((i) => i.id), method)
      if (res.error) {
        setError(res.error)
        setPhase('choose')
        return
      }
      setReceipt(res.id ?? '')
      setPhase('done')
    }, 1200)
  }

  return createPortal(
    <div className="scan" role="dialog" aria-modal="true" aria-label="Pay dues">
      <div className="scan__card pay">
        <div className="scan__head">
          <h2>{phase === 'done' ? 'Payment successful' : 'Pay dues'}</h2>
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
      </div>
    </div>,
    document.body,
  )
}
