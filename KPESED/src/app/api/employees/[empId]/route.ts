import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/employees/[empId]
// Returns full employee detail with all 11 sub-tables populated.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ empId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { empId } = await params
  if (!empId) {
    return NextResponse.json({ error: 'empId is required' }, { status: 400 })
  }

  const employee = await db.employee.findFirst({
    where: { OR: [{ empId }, { id: empId }] },
    include: {
      school: true,
      designation: true,
      district: true,
      tehsil: true,
      unionCouncil: true,
      postings: { orderBy: { fromDate: 'desc' } },
      bpsHistory: { orderBy: { fromDate: 'desc' } },
      jobTypeHistory: { orderBy: { fromDate: 'desc' } },
      cadreHistory: { orderBy: { fromDate: 'desc' } },
      qualifications: { orderBy: { sessionYear: 'asc' } },
      familyMembers: { orderBy: { dependentName: 'asc' } },
      bankDetails: { orderBy: { createdAt: 'asc' } },
      leavesDetail: true,
      trainings: true,
      documents: true,
    },
  })

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  return NextResponse.json({ employee })
}
