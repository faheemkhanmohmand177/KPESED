import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getStudentScope, scopeError } from '@/lib/student-scope'

/**
 * GET /api/students/attendance?date=YYYY-MM-DD&shift=S&className=5
 * Returns the school's students with their saved status for that date.
 */
export async function GET(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role.trim().toLowerCase() === 'school admin' && !emisCode) {
    return NextResponse.json({ error: scopeError(emisCode) }, { status: 403 })
  }
  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  const shift = url.searchParams.get('shift') || 'S'
  const className = url.searchParams.get('className') || ''
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 })
  const day = new Date(`${date}T00:00:00`)
  if (Number.isNaN(day.getTime())) return NextResponse.json({ error: 'invalid date' }, { status: 400 })

  const students = await db.studentProfile.findMany({
    where: { ...(emisCode ? { emisCode } : {}), ...(className ? { className } : {}) },
    orderBy: [{ className: 'asc' }, { studentName: 'asc' }],
    take: 2000,
  })
  const saved = await db.studentAttendance.findMany({
    where: {
      ...(emisCode ? { emisCode } : {}),
      attendanceDate: day,
      shift,
    },
  })
  const byStudent = new Map(saved.map((s) => [s.studentId, s]))
  const rows = students.map((st) => {
    const rec = byStudent.get(st.studentId)
    return {
      studentId: st.studentId,
      studentName: st.studentName,
      fatherName: st.fatherName,
      className: st.className,
      section: st.section,
      session: st.session,
      gender: st.gender,
      status: rec?.status || '',
      remarks: rec?.remarks || '',
      attendanceId: rec?.id || null,
    }
  })
  const summary = {
    total: rows.length,
    present: rows.filter((r) => r.status === 'Present').length,
    absent: rows.filter((r) => r.status === 'Absent').length,
    leave: rows.filter((r) => r.status === 'Leave').length,
    sickLeave: rows.filter((r) => r.status === 'Sick Leave').length,
    unmarked: rows.filter((r) => !r.status).length,
  }
  return NextResponse.json({ date, shift, rows, summary })
}

/**
 * POST /api/students/attendance
 * Body: { date, shift?, records: [{ studentId, status, remarks? }] }
 * Upserts attendance (unique per emis + student + date + shift).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const scoped = user.role.trim().toLowerCase() === 'school admin'
  const emisCode = scoped ? (user.emisCode?.trim() || null) : null
  if (scoped && !emisCode) return NextResponse.json({ error: scopeError(emisCode) }, { status: 403 })

  const body = await req.json().catch(() => null)
  const date = typeof body?.date === 'string' ? body.date : ''
  const shift = typeof body?.shift === 'string' ? body.shift : 'S'
  const records = Array.isArray(body?.records) ? body.records : null
  if (!date || !records?.length) {
    return NextResponse.json({ error: 'date and records are required' }, { status: 400 })
  }
  if (records.length > 2000) {
    return NextResponse.json({ error: 'records exceeds the maximum of 2000' }, { status: 400 })
  }
  const day = new Date(`${date}T00:00:00`)
  if (Number.isNaN(day.getTime())) return NextResponse.json({ error: 'invalid date' }, { status: 400 })

  const studentIds = records.map((r: { studentId?: unknown }) => String(r.studentId ?? '')).filter(Boolean)
  const students = await db.studentProfile.findMany({
    where: { ...(emisCode ? { emisCode } : {}), studentId: { in: studentIds } },
    select: { studentId: true, studentName: true, className: true, section: true, session: true, emisCode: true },
  })
  const byId = new Map(students.map((s) => [s.studentId, s]))

  let saved = 0
  let skipped = 0
  for (const rec of records) {
    const studentId = String(rec.studentId ?? '').trim()
    const status = String(rec.status ?? '').trim()
    if (!studentId || !status) { skipped++; continue }
    const student = byId.get(studentId)
    if (!student) { skipped++; continue }
    const emis = emisCode || student.emisCode
    if (!emis) { skipped++; continue }
    const base = {
      studentId,
      studentName: student.studentName,
      className: student.className,
      section: student.section,
      session: student.session,
      shift,
      attendanceDate: day,
      status,
      remarks: typeof rec.remarks === 'string' ? rec.remarks : null,
      markedById: user.id,
    }
    await db.studentAttendance.upsert({
      where: { emisCode_studentId_attendanceDate_shift: { emisCode: emis, studentId, attendanceDate: day, shift } },
      create: { ...base, emisCode: emis },
      update: { status, remarks: base.remarks, markedById: user.id },
    })
    saved++
  }
  return NextResponse.json({ saved, skipped })
}
