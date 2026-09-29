import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanString, getStudentScope } from '@/lib/student-scope'

export async function GET() {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.studentClassUpdate.findMany({ where: emisCode ? { emisCode } : {}, orderBy: { createdAt: 'desc' }, take: 1000 })
  return NextResponse.json({ updates: rows })
}
export async function POST(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const studentId = cleanString(body?.studentId), toClass = cleanString(body?.toClass)
  const effectiveDate = new Date(String(body?.effectiveDate || ''))
  if (!studentId || !toClass || Number.isNaN(effectiveDate.getTime())) return NextResponse.json({ error: 'Student ID, new class, and effective date are required.' }, { status: 400 })
  const student = await db.studentProfile.findFirst({ where: { studentId, ...(emisCode ? { emisCode } : {}) } })
  if (!student) return NextResponse.json({ error: 'Student not found in your school scope.' }, { status: 404 })
  const result = await db.$transaction(async (tx) => {
    const update = await tx.studentClassUpdate.create({ data: { emisCode: student.emisCode, studentId, fromClass: student.className, toClass, effectiveDate, remarks: cleanString(body?.remarks) } })
    const updatedStudent = await tx.studentProfile.update({ where: { id: student.id }, data: { className: toClass } })
    return { update, student: updatedStudent }
  })
  return NextResponse.json(result, { status: 201 })
}
