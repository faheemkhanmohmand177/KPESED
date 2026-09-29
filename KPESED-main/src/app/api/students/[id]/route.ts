import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanDate, cleanString, getStudentScope } from '@/lib/student-scope'

type Context = { params: Promise<{ id: string }> }
const fields = ['studentId','studentName','fatherName','gender','dateOfBirth','bForm','admissionNo','admissionDate','className','section','shift','session','status','religion','motherTongue','disability','orphan','minority','address','village','guardianName','guardianCnic','guardianPhone','district','tehsil','unionCouncil','schoolName','previousSchool','medium','transferStatus','result','remarks'] as const

export async function PATCH(req: Request, context: Context) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const existing = await db.studentProfile.findFirst({ where: { id, ...(emisCode ? { emisCode } : {}) } })
  if (!existing) return NextResponse.json({ error: 'Student not found in your school scope.' }, { status: 404 })
  const body = await req.json().catch(() => null) as Record<string, unknown> | null
  const data: Record<string, unknown> = {}
  for (const field of fields) if (body && field in body) data[field] = field === 'dateOfBirth' || field === 'admissionDate' ? cleanDate(body[field]) : cleanString(body[field])
  if (data.studentId === null || data.studentName === null) return NextResponse.json({ error: 'Student ID and student name are required.' }, { status: 400 })
  const student = await db.studentProfile.update({ where: { id: existing.id }, data: data as never })
  return NextResponse.json({ student })
}

export async function DELETE(_req: Request, context: Context) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const existing = await db.studentProfile.findFirst({ where: { id, ...(emisCode ? { emisCode } : {}) } })
  if (!existing) return NextResponse.json({ error: 'Student not found in your school scope.' }, { status: 404 })
  await db.studentProfile.delete({ where: { id: existing.id } })
  return NextResponse.json({ ok: true })
}
