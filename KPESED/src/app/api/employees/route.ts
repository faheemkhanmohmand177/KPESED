import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/employees
// Query params (all optional):
//   status — "Working" | "Active\Deputation & Others" (default Working)
//   district — district name (e.g. MOHMAND)
//   tehsil — tehsil name
//   schoolGender — MALE | FEMALE | MIXED
//   search — full-text search across name, cnic, personnelNo, emisCode, email
//   page — 1-based page number (default 1)
//   pageSize — rows per page (default 50, "All" supported)
//
// Returns the 32-column employee list as shown on the real KPESE site.
export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim() || ''
  const district = url.searchParams.get('district')?.trim() || ''
  const tehsil = url.searchParams.get('tehsil')?.trim() || ''
  const unionCouncil = url.searchParams.get('unionCouncil')?.trim() || ''
  const schoolGender = url.searchParams.get('schoolGender')?.trim() || ''
  const schoolEmis = url.searchParams.get('schoolEmis')?.trim() || ''
  const officeSchool = url.searchParams.get('officeSchool')?.trim() || 'Both'
  const statusFilter = url.searchParams.get('status')?.trim() || 'Working'
  const pageStr = url.searchParams.get('page') || '1'
  const pageSizeStr = url.searchParams.get('pageSize') || '50'

  // School admin scope — limit to their own school's emisCode unless they have a
  // higher-level role (we treat "school admin" as scoped to their school).
  const scopedEmis = user.role.toLowerCase() === 'school admin' ? user.emisCode : null

  // Build where clause
  const where: { AND: Record<string, unknown>[] } = { AND: [] }
  if (scopedEmis) {
    where.AND.push({ emisCode: scopedEmis })
  }
  if (district) {
    where.AND.push({ districtName: district })
  }
  if (tehsil) {
    where.AND.push({ tehsilName: tehsil })
  }
  if (unionCouncil) {
    where.AND.push({ OR: [{ ucName: unionCouncil }, { unionCouncil: { name: unionCouncil } }] })
  }
  if (schoolGender) {
    where.AND.push({ schoolGender })
  }
  if (schoolEmis) {
    where.AND.push({ emisCode: schoolEmis })
  }
  if (officeSchool === 'Office') {
    where.AND.push({ schoolId: null })
  } else if (officeSchool === 'School') {
    where.AND.push({ schoolId: { not: null } })
  }
  if (statusFilter === 'Working') {
    // "Working" means status is Verified/Working — i.e. currently employed
    where.AND.push({
      OR: [
        { status: { contains: 'Verified' } },
        { status: { contains: 'Working' } },
        { status: null },
      ],
    })
  } else {
    // Active\Deputation & Others — return all (in real site this returns a wider set)
  }
  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search } },
        { fatherOrHusbandName: { contains: search } },
        { cnic: { contains: search } },
        { personnelNo: { contains: search } },
        { emisCode: { contains: search } },
        { email: { contains: search } },
        { workingDesignation: { contains: search } },
      ],
    })
  }

  const page = Math.max(1, parseInt(pageStr, 10) || 1)
  const allRows = pageSizeStr === 'All'
  const pageSize = allRows ? 1000 : Math.max(1, parseInt(pageSizeStr, 10) || 50)
  const skip = (page - 1) * pageSize

  const [total, employees] = await Promise.all([
    db.employee.count({ where }),
    db.employee.findMany({
      where,
      // Keep a stable default order for the report.
      orderBy: [{ empId: 'asc' }],
      skip: allRows ? 0 : skip,
      take: allRows ? undefined : pageSize,
      include: {
        school: true,
        designation: true,
      },
    }),
  ])

  return NextResponse.json({
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    employees,
  })
}
