import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanString, getStudentScope } from '@/lib/student-scope'

export async function GET() {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.enrolmentCampaignTarget.findMany({ where: emisCode ? { emisCode } : {}, orderBy: [{ session: 'desc' }, { className: 'asc' }] })
  return NextResponse.json({ targets: rows })
}
export async function POST(req: Request) {
  const { user, emisCode } = await getStudentScope()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const session = cleanString(body?.session), className = cleanString(body?.className)
  const target = Number(body?.target)
  if (!session || !className || !Number.isInteger(target) || target < 0) return NextResponse.json({ error: 'Session, class, and a non-negative target are required.' }, { status: 400 })
  const row = await db.enrolmentCampaignTarget.upsert({ where: { emisCode_session_className: { emisCode: emisCode || String(body?.emisCode || ''), session, className } }, create: { emisCode: emisCode || String(body?.emisCode || ''), session, className, target, remarks: cleanString(body?.remarks) }, update: { target, remarks: cleanString(body?.remarks) } })
  if (!row.emisCode) return NextResponse.json({ error: 'EMIS code is required.' }, { status: 400 })
  return NextResponse.json({ target: row }, { status: 201 })
}
