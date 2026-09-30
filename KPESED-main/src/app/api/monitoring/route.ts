import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/monitoring
 * Returns the four Monitoring Dashboard comparison series (ASC vs iEMIS).
 * iEMIS values are live counts from this database; ASC values come from the
 * editable "monitoring-asc" portal records (Annual School Census entries).
 */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scoped = user.role.trim().toLowerCase() === 'school admin'
  const emisCode = scoped ? (user.emisCode?.trim() || null) : null

  const [employees, schools, students] = await Promise.all([
    db.employee.count({ where: emisCode ? { emisCode } : {} }),
    db.school.count({ where: emisCode ? { emisCode } : {} }),
    db.studentProfile.count({ where: emisCode ? { emisCode } : {} }),
  ])

  const ascRecords = await db.portalRecord.findMany({ where: { moduleKey: 'monitoring-asc' } })
  const asc = ascRecords[0]?.data as Record<string, unknown> | undefined
  const num = (v: unknown, fallback = 0) => (typeof v === 'number' ? v : Number(v) || fallback)

  return NextResponse.json({
    employees: {
      label: 'Employee Comparison (ASC & iEMIS)',
      asc: num(asc?.employees),
      iemis: employees,
    },
    schools: {
      label: 'Schools Comparison (ASC & iEMIS)',
      asc: num(asc?.schools),
      iemis: schools,
    },
    students: {
      label: 'Students Comparison (ASC & iEMIS)',
      asc: num(asc?.students),
      iemis: students,
    },
    sanctionPosts: {
      label: 'Sanction Posts Comparison (ASC & iEMIS)',
      asc: num(asc?.sanctionPosts),
      iemis: employees,
    },
  })
}

/**
 * POST /api/monitoring — save the ASC side of the four comparisons.
 * Body: { employees, schools, students, sanctionPosts } (numbers)
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role.trim().toLowerCase() === 'school admin') {
    return NextResponse.json({ error: 'Only elevated roles can update ASC values' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  const data = {
    employees: Number(body?.employees) || 0,
    schools: Number(body?.schools) || 0,
    students: Number(body?.students) || 0,
    sanctionPosts: Number(body?.sanctionPosts) || 0,
  }
  const existing = await db.portalRecord.findFirst({ where: { moduleKey: 'monitoring-asc' } })
  if (existing) {
    await db.portalRecord.update({ where: { id: existing.id }, data: { data } })
  } else {
    await db.portalRecord.create({ data: { moduleKey: 'monitoring-asc', data, createdById: user.id } })
  }
  return NextResponse.json({ saved: true, data })
}
