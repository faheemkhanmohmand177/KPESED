'use client'

import * as React from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { StatCard } from './ui/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, UserCheck, CalendarOff, Clock, UserPlus, FilePlus, ArrowRightLeft, Wallet,
  TrendingUp, GraduationCap,
} from 'lucide-react'
import type { SafeUser } from '@/lib/auth'

interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  onLeaveToday: number
  pendingLeaves: number
  pendingTransfers: number
  pendingApprovals: number
  attendanceToday: number
  byGender: { gender: string; count: number }[]
  byDistrict: { district: string; count: number }[]
  byBps: { bps: string; count: number }[]
  recentLeaves: Array<{
    id: string
    leaveType: string
    fromDate: string
    toDate: string
    noOfDays: number
    status: string
    employee?: { fullName: string; personalNo: string } | null
  }>
}

interface DashboardProps {
  user: SafeUser
  onNavigate: (m: string) => void
}

const GENDER_COLORS: Record<string, string> = {
  male: '#01411C',
  female: '#C9A96E',
  other: '#94a3b8',
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((e) => {
        console.error(e)
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const genderData = (stats?.byGender || []).map((g) => ({
    name: g.gender.charAt(0).toUpperCase() + g.gender.slice(1),
    value: g.count,
    color: GENDER_COLORS[g.gender] || '#94a3b8',
  }))

  const districtData = stats?.byDistrict || []
  const bpsData = (stats?.byBps || []).map((b) => ({
    bps: (b.bps || '').replace('bps_', 'BPS-'),
    count: b.count,
  }))

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.fullName.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Here&rsquo;s what&rsquo;s happening across the Education Department today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" size="sm" onClick={() => onNavigate('employees')}>
            <Users className="mr-2 h-4 w-4" /> Manage Employees
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('reports')}>
            <TrendingUp className="mr-2 h-4 w-4" /> View Reports
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={loading ? '…' : stats?.totalEmployees ?? 0}
          icon={<Users className="h-5 w-5" />}
          description={`${stats?.activeEmployees ?? 0} active · ${stats?.inactiveEmployees ?? 0} inactive`}
          accent="green"
        />
        <StatCard
          title="Active Employees"
          value={loading ? '…' : stats?.activeEmployees ?? 0}
          icon={<UserCheck className="h-5 w-5" />}
          description="Currently in service"
          accent="green"
        />
        <StatCard
          title="On Leave Today"
          value={loading ? '…' : stats?.onLeaveToday ?? 0}
          icon={<CalendarOff className="h-5 w-5" />}
          description="Approved leaves effective today"
          accent="gold"
        />
        <StatCard
          title="Pending Requests"
          value={loading ? '…' : (stats?.pendingLeaves ?? 0) + (stats?.pendingTransfers ?? 0)}
          icon={<Clock className="h-5 w-5" />}
          description={`${stats?.pendingLeaves ?? 0} leaves · ${stats?.pendingTransfers ?? 0} transfers`}
          accent="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Distribution</CardTitle>
            <CardDescription>Headcount by gender</CardDescription>
          </CardHeader>
          <CardContent>
            {genderData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {genderData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Employees by District (Top 8)</CardTitle>
            <CardDescription>Geographic distribution of staff</CardDescription>
          </CardHeader>
          <CardContent>
            {districtData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="district"
                      tick={{ fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Employees" fill="#01411C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employees by BPS Scale</CardTitle>
          <CardDescription>Headcount by Basic Pay Scale</CardDescription>
        </CardHeader>
        <CardContent>
          {bpsData.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bpsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="bps" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Employees" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Recent Leave Applications</CardTitle>
              <CardDescription>Latest 5 applications across the department</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('leaves')}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {!stats?.recentLeaves?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent leave applications.</p>
            ) : (
              <ul className="divide-y">
                {stats.recentLeaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-medium">{l.employee?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.leaveType} · {l.noOfDays} day{l.noOfDays > 1 ? 's' : ''} ·{' '}
                        {new Date(l.fromDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        l.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : l.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }
                    >
                      {l.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('employees')}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Employee
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('leaves')}>
              <FilePlus className="mr-2 h-4 w-4" /> Apply Leave
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('transfers')}>
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Initiate Transfer
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('payroll')}>
              <Wallet className="mr-2 h-4 w-4" /> Generate Payroll
            </Button>
            <div className="rounded-lg border border-[#01411C]/10 bg-[#01411C]/5 p-3 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#01411C]" />
                <span className="font-semibold text-[#01411C]">KPESE HRMIS</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                A custom HR management system inspired by the Khyber Pakhtunkhwa Elementary &amp; Secondary Education Department.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
