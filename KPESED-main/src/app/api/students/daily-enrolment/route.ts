import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanString, getStudentScope } from '@/lib/student-scope'

export async function GET() {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.dailyStudentEnrolment.findMany({ where: emisCode ? { emisCode } : {}, orderBy: { enrolmentDate: 'desc' }, take: 1000 })
  return NextResponse.json({ enrolments: rows })
}
export async function POST(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const date = new Date(String(body?.enrolmentDate || ''))
  const className = cleanString(body?.className)
  const male = Number(body?.male || 0), female = Number(body?.female || 0), transgender = Number(body?.transgender || 0)
  if (Number.isNaN(date.getTime()) || !className || [male, female, transgender].some((v) => !Number.isInteger(v) || v < 0)) return NextResponse.json({ error: 'Date, class, and non-negative counts are required.' }, { status: 400 })
  const row = await db.dailyStudentEnrolment.upsert({ where: { emisCode_enrolmentDate_className: { emisCode: emisCode || String(body?.emisCode || ''), enrolmentDate: date, className } }, create: { emisCode: emisCode || String(body?.emisCode || ''), enrolmentDate: date, className, male, female, transgender, total: male + female + transgender, remarks: cleanString(body?.remarks) }, update: { male, female, transgender, total: male + female + transgender, remarks: cleanString(body?.remarks) } })
  if (!row.emisCode) return NextResponse.json({ error: 'EMIS code is required.' }, { status: 400 })
  return NextResponse.json({ enrolment: row }, { status: 201 })
}
