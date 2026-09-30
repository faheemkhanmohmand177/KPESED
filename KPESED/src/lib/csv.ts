// Lightweight CSV export utility for HRMIS reports.

export function toCsvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Escape quotes by doubling them, wrap in quotes if contains comma/quote/newline
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines: string[] = []
  lines.push(headers.map(toCsvField).join(','))
  for (const row of rows) {
    lines.push(headers.map((h) => toCsvField(row[h])).join(','))
  }
  return lines.join('\r\n')
}

/**
 * Triggers a CSV download in the browser.
 * Usage:
 *   downloadCsv([{a:1,b:2}], 'report.csv')
 */
export function downloadCsv(rows: Record<string, unknown>[], filename: string): void {
  const csv = buildCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
