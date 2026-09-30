'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { SafeUser } from '@/lib/auth'
import { LoginPage } from '@/components/hrmis/login-page'
import { AppShell } from '@/components/hrmis/app-shell'
import { HomePage } from '@/components/hrmis/home-page'
import { EmployeeProfilesPage } from '@/components/hrmis/employee-profiles-page'
import { EmployeeDetailPage } from '@/components/hrmis/employee-detail-page'
import { TeacherAttendancePage } from '@/components/hrmis/teacher-attendance-page'
import { ModulePage } from '@/components/hrmis/module-page'
import { SchoolProfilesPage } from '@/components/hrmis/school-profiles-page'
import { ErrorPage } from '@/components/hrmis/error-page'
import { StudentsMisPage } from '@/components/hrmis/students-mis-page'
import { AssetMisPage } from '@/components/hrmis/asset-mis-page'
import { RealModulePage } from '@/components/hrmis/real-module-page'
import { StudentAttendancePage } from '@/components/hrmis/student-attendance-page'
import { StudentPromotionPage } from '@/components/hrmis/student-promotion-page'
import { MonitoringDashboardPage } from '@/components/hrmis/monitoring-dashboard-page'
import { REAL_MODULES } from '@/lib/real-modules'
import { resolveModuleKey } from '@/lib/portal-navigation'
import { Suspense } from 'react'

/**
 * SPA entry for the Integrated EMIS portal.
 *
 * The user can ONLY see `/` route. Module navigation uses the `?module=...`
 * query parameter. Possible values:
 *   - home (default)
 *   - employee-profiles
 *   - employee-detail (with &empId=...)
 *   - teacher-attendance
 *   - attendance-report (Oracle error)
 *   - leaves-report (Oracle error)
 *   - any other sidebar item: opens its report workspace
 */
function PageInner() {
  const search = useSearchParams()
  const router = useRouter()
  const rawModule = search.get('module') || 'home'
  // Legacy deep-links (?module=employee-profiles …) resolve to the live-site slugs.
  const module_ = resolveModuleKey(rawModule)
  const empId = search.get('empId') || ''

  const [user, setUser] = React.useState<SafeUser | null>(null)
  const [authChecked, setAuthChecked] = React.useState(false)

  // Initial auth check
  React.useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) {
          setUser(d?.user ?? null)
          setAuthChecked(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setAuthChecked(true)
        }
      })
    return () => { cancelled = true }
  }, [])

  // Navigate by setting the URL search params (so sidebar clicks deep-link)
  const navigate = React.useCallback(
    (m: string, extra?: Record<string, string>) => {
      const params = new URLSearchParams()
      params.set('module', m)
      if (m === 'employee-detail' && extra?.empId) params.set('empId', extra.empId)
      router.push(`/?${params.toString()}`)
    },
    [router]
  )

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setUser(null)
    toast.success('Signed out')
    router.push('/')
  }

  // Show spinner while checking auth
  if (!authChecked) {
    return (
      <div className="flex min-h-screen min-h-svh items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1565c0] border-t-transparent" />
          <p className="text-sm">Loading HRMIS…</p>
        </div>
      </div>
    )
  }

  // Not authenticated → show login
  if (!user) {
    return <LoginPage onSuccess={(u) => setUser(u)} />
  }

  // Narrowed user for the module renderers below (TS cannot keep the
  // narrowing inside the hoisted renderModule function declaration).
  const activeUser: SafeUser = user

  function renderModule() {
    switch (module_) {
      case 'home':
        return <HomePage />
      case 'office-school-list':
      case 'office-school-profiles':
        return <SchoolProfilesPage user={activeUser} />
      case 'employee-search':
      case 'employee-profiles':
        return <EmployeeProfilesPage onOpenEmployee={(id) => navigate('employee-detail', { empId: id })} />
      case 'employee-detail':
        if (!empId) {
          return (
            <div className="apex-region">
              <div className="apex-region-body text-center text-gray-500 py-8">
                Missing employee id.{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('employee-profiles') }} className="text-[#1565c0] hover:underline">
                  Go to Employee Profiles
                </a>
              </div>
            </div>
          )
        }
        return <EmployeeDetailPage empId={empId} onBack={() => navigate('employee-profiles')} />
      case 'teacher-attendance':
        return <TeacherAttendancePage />
      case 'students-search':
      case 'students-profiles':
        return <StudentsMisPage module="students-profiles" title="Students Profiles" onNavigate={navigate} />
      case 'student-data-uploading':
        return <StudentsMisPage module="student-data-uploading" title="Student Data Uploading" onNavigate={navigate} />
      case 'target-student-enrolment':
      case 'enrolment-campaign-target':
        return <StudentsMisPage module="enrolment-campaign-target" title="Enrolment Campaign Target" onNavigate={navigate} />
      case 'daily-students-enrolment':
        return <StudentsMisPage module="daily-students-enrolment" title="Daily Students Enrolment" onNavigate={navigate} />
      case 'students-class_update':
      case 'students-class-update':
        return <StudentsMisPage module="students-class-update" title="Students Class Update" onNavigate={navigate} />
      case 'student-attendence':
        return <StudentAttendancePage onNavigate={navigate} />
      case 'student-class-promotion':
        return <StudentPromotionPage onNavigate={navigate} />
      case 'student-class-promotion-double-shift':
        return <StudentPromotionPage doubleShift onNavigate={navigate} />
      case 'monitoring-dashboard':
        return <MonitoringDashboardPage onNavigate={navigate} />
      case 'asset-profile':
        return <AssetMisPage view="profile" onNavigate={navigate} />
      case 'assets-detail':
        return <AssetMisPage view="details" onNavigate={navigate} />
      case 'assets-report':
        return <AssetMisPage view="report" onNavigate={navigate} />
      case 'teacher-attendance-report':
      case 'attendance-report':
        return <ErrorPage title="SCHOOL DETAIL" />
      default: {
        // Every other sidebar item renders its faithful APEX workspace built
        // from the live-site capture (exact columns, filters, empty states).
        // Modules already implemented keep their own switch cases above; a
        // legacy generic shell remains as a final fallback.
        const realConfig = REAL_MODULES[module_]
        if (realConfig) return <RealModulePage moduleKey={module_} config={realConfig} onNavigate={(m) => navigate(m)} />
        return <ModulePage module={module_} onNavigate={(m) => navigate(m)} />
      }
    }
  }

  return (
    <AppShell
      user={user}
      activeModule={module_}
      onModuleChange={(m) => navigate(m)}
      onLogout={handleLogout}
    >
      {renderModule()}
    </AppShell>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen min-h-svh items-center justify-center">Loading…</div>}>
      <PageInner />
    </Suspense>
  )
}
