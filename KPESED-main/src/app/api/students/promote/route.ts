import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getStudentScope, scopeError } from '@/lib/student-scope'

/**
 * GET /api/students/promote?session=2026-27&shift=S
 * Lists promotion records for the school.
 */
export async function GET(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const session = url.searchParams.get('session') || ''
  const shift = url.searchParams.get('shift') || 'S'
  const rows = await db.studentPromotion.findMany({
    where: { ...(emisCode ? { emisCode } : {}), ...(session ? { session } : {}), shift },
    orderBy: { updatedAt: 'desc' },
    take: 2000,
  })
  return NextResponse.json({ promotions: rows })
}

/**
 * POST /api/students/promote
 * Body: { session, shift?, promotedDate?, records: [{ studentId, toClass,
 *          classSection?, newAdmissionNo?, certificateIssue?, status? }] }
 * Upserts promotions (unique per emis + student + session + shift).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scoped = user.role.trim().toLowerCase() === 'school admin'
  const emisCode = scoped ? (user.emisCode?.trim() || null) : null
  if (scoped && !emisCode) return NextResponse.json({ error: scopeError(emisCode) }, { status: 403 })

  const body = await req.json().catch(() => null)
  const session = typeof body?.session === 'string' ? body.session.trim() : ''
  const shift = typeof body?.shift === 'string' ? body.shift : 'S'
  const promotedDate = typeof body?.promotedDate === 'string' && body.promotedDate ? new Date(`${body.promotedDate}T00:00:00`) : new Date()
  const records = Array.isArray(body?.records) ? body.records : null
  if (!session || !records?.length) {
    return NextResponse.json({ error: 'session and records are required' }, { status: 400 })
  }
  if (records.length > 2000) {
    return NextResponse.json({ error: 'records exceeds the maximum of 2000' }, { status: 400 })
  }

  const studentIds = records.map((r: { studentId?: unknown }) => String(r.studentId ?? '')).filter(Boolean)
  const students = await db.studentProfile.findMany({
    where: { ...(emisCode ? { emisCode } : {}), studentId: { in: studentIds } },
    select: { studentId: true, studentName: true, fatherName: true, gender: true, className: true, emisCode: true, guardianCnic: true, admissionNo: true },
  })
  const byId = new Map(students.map((s) => [s.studentId, s]))

  let promoted = 0
  let skipped = 0
  for (const rec of records) {
    const studentId = String(rec.studentId ?? '').trim()
    const toClass = String(rec.toClass ?? '').trim()
    if (!studentId || !toClass) { skipped++; continue }
    const student = byId.get(studentId)
    if (!student) { skipped++; continue }
    const emis = emisCode || student.emisCode
    if (!emis) { skipped++; continue }
    const data = {
      studentName: student.studentName,
      fatherName: student.fatherName,
      gender: student.gender,
      fatherCnic: student.guardianCnic,
      fromClass: student.className,
      toClass,
      classSection: typeof rec.classSection === 'string' ? rec.classSection : null,
      admissionNo: student.admissionNo,
      newAdmissionNo: typeof rec.newAdmissionNo === 'string' ? rec.newAdmissionNo : null,
      certificateIssue: typeof rec.certificateIssue === 'string' ? rec.certificateIssue : null,
      status: typeof rec.status === 'string' ? rec.status : 'PROMOTED',
      promotedDate,
    }
    await db.studentPromotion.upsert({
      where: { emisCode_studentId_session_shift: { emisCode: emis, studentId, session, shift } },
      create: { ...data, emisCode: emis, studentId, session, shift, createdById: user.id },
      update: data,
    })
    promoted++
  }
  return NextResponse.json({ promoted, skipped })
}
