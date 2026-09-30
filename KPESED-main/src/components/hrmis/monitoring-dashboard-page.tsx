'use client'

import * as React from 'react'
import { BarChart3, ChevronRight, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'

type Series = { label: string; asc: number; iemis: number }
type Monitoring = { employees: Series; schools: Series; students: Series; sanctionPosts: Series }

/**
 * Monitoring Dashboard — the four ASC & iEMIS comparison charts. iEMIS values
 * are live counts from this portal's database; ASC values are editable by
 * elevated roles (Annual School Census figures).
 */
export function MonitoringDashboardPage({ onNavigate }: { onNavigate: (m: string) => void }) {
  const [data, setData] = React.useState<Monitoring | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [asc, setAsc] = React.useState({ employees: '', schools: '', students: '', sanctionPosts: '' })

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/monitoring', { cache: 'no-store' })
      const d = await r.json()
      if (r.ok) {
        setData(d)
        setAsc({
          employees: String(d.employees?.asc ?? 0),
          schools: String(d.schools?.asc ?? 0),
          students: String(d.students?.asc ?? 0),
          sanctionPosts: String(d.sanctionPosts?.asc ?? 0),
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { void load() }, [load])

  async function saveAsc() {
    setSaving(true)
    try {
      const r = await fetch('/api/monitoring', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          employees: Number(asc.employees) || 0,
          schools: Number(asc.schools) || 0,
          students: Number(asc.students) || 0,
          sanctionPosts: Number(asc.sanctionPosts) || 0,
        }),
      })
      const d = await r.json()
      if (!r.ok) { toast.error(d.error || 'Unable to save ASC values.'); return }
      toast.success('ASC comparison values saved.')
      await load()
    } finally {
      setSaving(false)
    }
  }

  const charts = data ? [data.employees, data.schools, data.students, data.sanctionPosts] : []

  return (
    <div className="t-Body-contentInner">
      <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <button type="button" onClick={() => onNavigate('home')} className="hover:text-[#1565c0] hover:underline">Home</button>
        <ChevronRight className="h-3 w-3" /><span className="font-medium text-[#1565c0]">Monitoring Dashboard</span>
      </nav>
      <h1 className="mb-2 text-base font-semibold text-[#333] sm:text-lg">Monitoring Dashboard</h1>

      <section className="apex-region mb-3" aria-label="ASC values">
        <div className="apex-region-header min-h-[34px]">
          <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 text-gray-500" />ASC &amp; iEMIS Values</span>
          <span className="flex gap-1.5">
            <button type="button" className="apex-btn" onClick={() => void load()}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
            <button type="button" className="apex-btn apex-btn--primary" onClick={() => void saveAsc()} disabled={saving}><Save className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save ASC'}</button>
          </span>
        </div>
        <div className="apex-region-body">
          <div className="mb-1 flex flex-wrap items-end gap-3 rounded border border-[#e5e5e5] bg-[#fafafa] p-3">
            {([
              ['employees', 'ASC Employees'],
              ['schools', 'ASC Schools'],
              ['students', 'ASC Students'],
              ['sanctionPosts', 'ASC Sanction Posts'],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="apex-form-label" htmlFor={`asc-${key}`}>{label}</label>
                <input id={`asc-${key}`} type="number" className="apex-input min-w-[120px]" value={asc[key]} onChange={(e) => setAsc((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">iEMIS bars update live from this portal&apos;s own records. ASC bars store the Annual School Census figures for the same comparison.</p>
        </div>
      </section>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {charts.map((series) => (
            <section key={series.label} className="apex-region" aria-label={series.label}>
              <div className="apex-region-header min-h-[34px]">
                <span className="flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5 text-gray-500" />{series.label}</span>
                <span className="flex gap-1.5"><button type="button" className="apex-btn">Stack</button><button type="button" className="apex-btn">Unstack</button></span>
              </div>
              <div className="apex-region-body h-[260px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Comparison', ASC: series.asc, iEMIS: series.iemis }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="ASC" fill="#f0a13a" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="iEMIS" fill="#1565c0" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
