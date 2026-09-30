import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/designations — returns all designations (full BPS-1 to BPS-22 list)
// Used by the Teacher Attendance page's reference list at the bottom.
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const designations = await db.designation.findMany({
    orderBy: [{ bps: 'asc' }, { title: 'asc' }],
    select: { id: true, title: true, bps: true, category: true, level: true },
  })
  return NextResponse.json({ designations })
}
