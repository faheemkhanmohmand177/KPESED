'use client'

import * as React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users, UserCheck, MapPin, Briefcase, CalendarOff, Wallet, Calendar,
  Download, FileText, TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCsv } from '@/lib/csv'

const GENDER_COLORS: Record<string, string> = { male: '#01411C', female: '#C9A96E', other: '#94a3b8' }

interface ReportCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onExport: () => void
  children?: React.ReactNode
  loading?: boolean
}

function ReportCard({ title, description, icon, onExport, children, loading }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#01411C]/10 text-[#01411C]">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 animate-pulse rounded bg-muted" />
        ) : children || (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No preview available.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ReportsModule() {
  const [empStrength, setEmpStrength] = React.useState<any>(null)
  const [genderDist, setGenderDist] = React.useState<any>(null)
  const [districtWise, setDistrictWise] = React.useState<any>(null)
  const [designationWise, setDesignationWise] = React.useState<any>(null)
  const [leaveSummary, setLeaveSummary] = React.useState<any>(null)
  const [payrollSummary, setPayrollSummary] = React.useState<any>(null)
  const [attendanceSummary, setAttendanceSummary] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/reports/employee-strength').then((r) => r.json()),
      fetch('/api/reports/gender-distribution').then((r) => r.json()),
      fetch('/api/reports/district-wise').then((r) => r.json()),
      fetch('/api/reports/designation-wise').then((r) => r.json()),
      fetch('/api/reports/leave-summary').then((r) => r.json()),
      fetch('/api/reports/payroll-summary').then((r) => r.json()),
      fetch('/api/reports/attendance-summary').then((r) => r.json()),
    ])
      .then(([e, g, d, de, l, p, a]) => {
        setEmpStrength(e); setGenderDist(g); setDistrictWise(d); setDesignationWise(de)
        setLeaveSummary(l); setPayrollSummary(p); setAttendanceSummary(a)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports &amp; Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Generate, view, and export department-wide HR statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Employee Strength */}
        <ReportCard
          title="Employee Strength Report"
          description="Headcount by status, gender, type"
          icon={<Users className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!empStrength) return
            downloadCsv([
              { Metric: 'Total', Value: empStrength.total },
              ...empStrength.byStatus.map((s: any) => ({ Metric: `Status: ${s.status}`, Value: s._count })),
              ...empStrength.byGender.map((s: any) => ({ Metric: `Gender: ${s.gender}`, Value: s._count })),
              ...empStrength.byType.map((s: any) => ({ Metric: `Type: ${s.employeeType}`, Value: s._count })),
            ], 'employee-strength.csv')
            toast.success('Exported')
          }}
        >
          {empStrength && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{empStrength.total}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground">By Gender</p>
                <ul className="mt-1 text-xs">
                  {empStrength.byGender.map((g: any) => (
                    <li key={g.gender} className="flex justify-between"><span className="capitalize">{g.gender}</span><span className="font-mono">{g._count}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </ReportCard>

        {/* Gender Distribution */}
        <ReportCard
          title="Gender-wise Distribution"
          description="Male vs Female headcount"
          icon={<UserCheck className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!genderDist) return
            downloadCsv(genderDist.byGender.map((g: any) => ({ Gender: g.gender, Count: g.count })), 'gender-distribution.csv')
            toast.success('Exported')
          }}
        >
          {genderDist && genderDist.byGender.length > 0 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderDist.byGender.map((g: any) => ({ name: g.gender, value: g.count }))} dataKey="value" nameKey="name" outerRadius={70} label>
                    {genderDist.byGender.map((g: any, i: number) => (
                      <Cell key={i} fill={GENDER_COLORS[g.gender] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ReportCard>

        {/* District-wise Summary */}
        <ReportCard
          title="District-wise Summary"
          description="Employee count per district"
          icon={<MapPin className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!districtWise) return
            downloadCsv(districtWise.byDistrict.map((d: any) => ({ District: d.name, Count: d.count })), 'district-wise.csv')
            toast.success('Exported')
          }}
        >
          {districtWise && districtWise.byDistrict.length > 0 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtWise.byDistrict} margin={{ top: 0, right: 0, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#01411C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ReportCard>

        {/* Designation-wise Summary */}
        <ReportCard
          title="Designation-wise Summary"
          description="Headcount by designation/BPS"
          icon={<Briefcase className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!designationWise) return
            downloadCsv(designationWise.byBps.map((d: any) => ({ BPS: d.bps, Count: d.count })), 'designation-wise.csv')
            toast.success('Exported')
          }}
        >
          {designationWise && designationWise.byBps.length > 0 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={designationWise.byBps.map((b: any) => ({ bps: b.bps.replace('bps_', 'BPS-'), count: b.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="bps" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ReportCard>

        {/* Leave Summary */}
        <ReportCard
          title="Leave Summary"
          description="Leave applications by status & type"
          icon={<CalendarOff className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!leaveSummary) return
            downloadCsv([
              { Metric: 'Total Applications', Value: leaveSummary.total },
              { Metric: 'Total Days', Value: leaveSummary.totalDays },
              ...leaveSummary.byStatus.map((s: any) => ({ Metric: `Status: ${s.status}`, Value: s.count })),
              ...leaveSummary.byType.map((s: any) => ({ Metric: `Type: ${s.type}`, Value: s.count })),
            ], 'leave-summary.csv')
            toast.success('Exported')
          }}
        >
          {leaveSummary && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="uppercase text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{leaveSummary.total}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="uppercase text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold">{leaveSummary.totalDays}</p>
              </div>
              <div className="col-span-2 rounded-md border bg-muted/30 p-3">
                <p className="uppercase text-muted-foreground">By Status</p>
                <ul className="mt-1 space-y-1">
                  {leaveSummary.byStatus.map((s: any) => (
                    <li key={s.status} className="flex justify-between"><span className="capitalize">{s.status}</span><span className="font-mono">{s.count}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </ReportCard>

        {/* Payroll Summary */}
        <ReportCard
          title="Payroll Summary"
          description="All-time payroll totals"
          icon={<Wallet className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!payrollSummary) return
            downloadCsv([
              { Metric: 'Total Records', Value: payrollSummary.totalRecords },
              { Metric: 'Total Earnings', Value: payrollSummary.totalEarnings },
              { Metric: 'Total Deductions', Value: payrollSummary.totalDeductions },
              { Metric: 'Net Payout', Value: payrollSummary.netPayout },
            ], 'payroll-summary.csv')
            toast.success('Exported')
          }}
        >
          {payrollSummary && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="uppercase text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{payrollSummary.totalRecords}</p>
              </div>
              <div className="rounded-md border bg-emerald-50 p-3">
                <p className="uppercase text-emerald-700">Total Earnings</p>
                <p className="text-lg font-bold text-emerald-800">Rs {payrollSummary.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="rounded-md border bg-red-50 p-3">
                <p className="uppercase text-red-700">Total Deductions</p>
                <p className="text-lg font-bold text-red-800">Rs {payrollSummary.totalDeductions.toLocaleString()}</p>
              </div>
              <div className="rounded-md border bg-amber-50 p-3">
                <p className="uppercase text-amber-700">Net Payout</p>
                <p className="text-lg font-bold text-amber-800">Rs {payrollSummary.netPayout.toLocaleString()}</p>
              </div>
            </div>
          )}
        </ReportCard>

        {/* Attendance Summary */}
        <ReportCard
          title="Attendance Summary"
          description="Today vs this month"
          icon={<Calendar className="h-5 w-5" />}
          loading={loading}
          onExport={() => {
            if (!attendanceSummary) return
            downloadCsv([
              ...attendanceSummary.today.map((s: any) => ({ Period: `Today: ${s.status}`, Count: s.count })),
              ...attendanceSummary.thisMonth.map((s: any) => ({ Period: `This Month: ${s.status}`, Count: s.count })),
            ], 'attendance-summary.csv')
            toast.success('Exported')
          }}
        >
          {attendanceSummary && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="uppercase text-muted-foreground">Today</p>
                <ul className="mt-1 space-y-1">
                  {attendanceSummary.today.length === 0 ? <li>—</li> : attendanceSummary.today.map((s: any) => (
                    <li key={s.status} className="flex justify-between"><span className="capitalize">{s.status}</span><span className="font-mono">{s.count}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="uppercase text-muted-foreground">This Month</p>
                <ul className="mt-1 space-y-1">
                  {attendanceSummary.thisMonth.length === 0 ? <li>—</li> : attendanceSummary.thisMonth.map((s: any) => (
                    <li key={s.status} className="flex justify-between"><span className="capitalize">{s.status}</span><span className="font-mono">{s.count}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </ReportCard>
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <FileText className="h-5 w-5 text-[#01411C]" />
          <p>
            All reports are based on live data from the HRMIS database. Click <strong>CSV</strong> on each card to download.
            PDF reports can be printed via your browser&rsquo;s print dialog.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsModule
