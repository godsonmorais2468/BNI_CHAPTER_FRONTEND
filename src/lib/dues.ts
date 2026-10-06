import type { Invoice } from './types'

/** Today as YYYY-MM-DD in local time. */
export const dayOf = (ms: number) => new Date(ms).toLocaleDateString('en-CA')

export const isOverdue = (inv: Invoice, now: number) => inv.status === 'due' && inv.dueDate < dayOf(now)

export const totalOf = (invoices: Invoice[]) => Math.round(invoices.reduce((n, i) => n + i.amount, 0) * 100) / 100
