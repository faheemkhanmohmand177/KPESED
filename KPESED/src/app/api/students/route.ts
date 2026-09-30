import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanDate, cleanString, getStudentScope, scopedWhere } from '@/lib/student-scope'

const profileFields = ['studentId','studentName','fatherName','gender','dateOfBirth','bForm','admissionNo','admissionDate','className','section','shift','session','status','religion','motherTongue','disability','orphan','minority','address','village','guardianName','guardianCnic','guardianPhone','district','tehsil','unionCouncil','schoolName','previousSchool','medium','transferStatus','result','remarks'] as const
function profileData(input: Record<string, unknown>, emisCode: string) {
  const data: Record<string, unknown> = { emisCode }
  for (const field of profileFields) {
    if (field === 'dateOfBirth' || field === 'admissionDate') data[field] = cleanDate(input[field])
    else data[field] = cleanString(input[field])
  }
  if (!data.studentId || !data.studentName) throw new Error('Student ID and student name are required.')
  return data
}

export async function GET(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role.trim().toLowerCase() === 'school admin' && !emisCode) return NextResponse.json({ error: 'Your account is not assigned to a school.' }, { status: 403 })
  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim() || ''
  const className = url.searchParams.get('className')?.trim() || ''
  const status = url.searchParams.get('status')?.trim() || ''
  const rows = await db.studentProfile.findMany({ where: { ...scopedWhere(emisCode), ...(className ? { className } : {}), ...(status ? { status } : {}), ...(search ? { OR: [{ studentId: { contains: search } }, { studentName: { contains: search } }, { fatherName: { contains: search } }, { bForm: { contains: search } }] } : {}) }, orderBy: { studentName: 'asc' }, take: 2000 })
  return NextResponse.json({ total: rows.length, students: rows })
}

export async function POST(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role.trim().toLowerCase() === 'school admin' && !emisCode) return NextResponse.json({ error: 'Your account is not assigned to a school.' }, { status: 403 })
  const body = await req.json().catch(() => null)
  const inputRows = Array.isArray(body?.rows) ? body.rows : [body]
  if (inputRows.length > 2000) return NextResponse.json({ error: 'Upload is limited to 2,000 students per batch.' }, { status: 400 })
  try {
    const rows = inputRows.map((input) => profileData(input as Record<string, unknown>, emisCode || cleanString((input as Record<string, unknown>).emisCode) || ''))
    if (rows.some((row) => !row.emisCode)) return NextResponse.json({ error: 'EMIS code is required.' }, { status: 400 })
    const saved = await db.$transaction(rows.map((row) => db.studentProfile.upsert({ where: { emisCode_studentId: { emisCode: String(row.emisCode), studentId: String(row.studentId) } }, create: row as never, update: row as never })))
    return NextResponse.json({ count: saved.length, students: saved }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save student data.' }, { status: 400 })
  }
}
