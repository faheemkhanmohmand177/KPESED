import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/districts — returns all districts (name, code, division)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const districts = await db.district.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true, division: true, region: true },
  })
  // Also return all tehsils & union councils in one go for the cascading filter
  const tehsils = await db.tehsil.findMany({
    select: { id: true, name: true, districtId: true },
    orderBy: { name: 'asc' },
  })
  const schools = await db.school.findMany({
    select: {
      id: true,
      emisCode: true,
      name: true,
      gender: true,
      ddoCode: true,
      districtId: true,
      tehsilId: true,
    },
    orderBy: { name: 'asc' },
  })
  const unionCouncils = await db.unionCouncil.findMany({
    select: { id: true, name: true, districtId: true, tehsilId: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ districts, tehsils, unionCouncils, schools })
}
