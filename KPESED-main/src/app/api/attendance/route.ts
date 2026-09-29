import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/attendance?date=YYYY-MM-DD
//   Returns attendance records for the given date (defaults to today).
// POST /api/attendance
//   Body: { date, records: [{ employeeId, status, remarks }] }
//   Marks attendance for multiple employees on the given date.
export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const dateStr = url.searchParams.get('date')
  let date: Date
  if (dateStr) {
    date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
  } else {
    date = new Date()
  }
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const records = await db.attendance.findMany({
    where: { attendanceDate: { gte: start, lte: end } },
    include: { employee: true },
  })

  return NextResponse.json({ date: start.toISOString().slice(0, 10), records })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const dateStr = String(body?.date ?? '')
  const records = Array.isArray(body?.records) ? body.records : []
  if (!dateStr || records.length === 0) {
    return NextResponse.json({ error: 'date and records are required' }, { status: 400 })
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  let created = 0
  let updated = 0
  for (const r of records) {
    const employeeId = String(r.employeeId ?? '')
    const status = String(r.status ?? 'present').toLowerCase()
    const remarks = r.remarks ? String(r.remarks) : null
    if (!employeeId) continue
    // Upsert by (employeeId, attendanceDate)
    const existing = await db.attendance.findFirst({
      where: { employeeId, attendanceDate: date },
    })
    if (existing) {
      await db.attendance.update({
        where: { id: existing.id },
        data: { status, remarks, markedById: user.id },
      })
      updated++
    } else {
      await db.attendance.create({
        data: { employeeId, attendanceDate: date, status, remarks, markedById: user.id },
      })
      created++
    }
  }

  return NextResponse.json({ ok: true, created, updated })
}
