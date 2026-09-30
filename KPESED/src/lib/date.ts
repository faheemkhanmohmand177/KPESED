/*
 * KPESE HRMIS — Date formatting helpers
 * Real site uses Oracle's DD-MMM-YYYY format (e.g. 02-FEB-1988, 29-OCT-2021).
 */

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

// Format a Date / ISO string / null as "02-FEB-1988" — matches the real site.
export function fmtDate(input?: Date | string | null): string {
  if (!input) return ''
  const d = typeof input === 'string' ? new Date(input) : input
  if (!(d instanceof Date) || isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_SHORT[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

// Format tenure as "4 (Y) 10 (M) 29 (D)" — matches the real site.
export function fmtTenure(years?: number | null, months?: number | null, days?: number | null): string {
  const y = years ?? 0
  const m = months ?? 0
  const d = days ?? 0
  if (y === 0 && m === 0 && d === 0) return ''
  return `${y} (Y) ${m} (M) ${d} (D)`
}

// Convert ISO date string to a <input type="date"> value (YYYY-MM-DD).
export function toInputDate(input?: Date | string | null): string {
  if (!input) return ''
  const d = typeof input === 'string' ? new Date(input) : input
  if (!(d instanceof Date) || isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Convert any value to a display string (replaces null/undefined with "").
export function toStr(v: unknown): string {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : ''
  return String(v)
}
