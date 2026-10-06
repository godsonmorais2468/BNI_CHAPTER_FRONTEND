import type { Mode, Plan } from './types'

export const MODES: { key: Mode; label: string; months: number; note: string }[] = [
  { key: 'monthly', label: 'Monthly', months: 1, note: 'Pay every month' },
  { key: 'tenure', label: 'Tenure (6 months)', months: 6, note: 'Pay once for six months' },
]

const round2 = (n: number) => Math.round(n * 100) / 100

export function priceFor(plan: Plan, mode: Mode) {
  const months = mode === 'tenure' ? 6 : 1
  const base = round2(plan.rate * months)
  const tax = round2((base * plan.taxPercent) / 100)
  return { months, base, tax, total: round2(base + tax) }
}

export function modeLabel(mode: Mode) {
  return MODES.find((m) => m.key === mode)?.label ?? mode
}
