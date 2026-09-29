import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getUserById } from '@/lib/user-store'

type Context = { params: Promise<{ id: string }> }
const elevated = (role: string) => ['admin', 'deo', 'ddeo'].includes(role.trim().toLowerCase())

export async function PATCH(req: Request, context: Context) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const current = await getUserById(sessionUser.id)
  const { id } = await context.params
  const existing = await db.school.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'School not found.' }, { status: 404 })
  if (!elevated(sessionUser.role) && current?.emisCode !== existing.emisCode) return NextResponse.json({ error: 'You can only edit your own school.' }, { status: 403 })
  const body = await req.json().catch(() => null)
  const school = await db.school.update({ where: { id }, data: {
    emisCode: elevated(sessionUser.role) ? (body.emisCode || existing.emisCode) : existing.emisCode,
    name: body.name || existing.name, schoolType: body.schoolType || null,
    gender: body.gender || null, ddoCode: body.ddoCode || null, address: body.address || null,
  } })
  return NextResponse.json({ school })
}

export async function DELETE(_req: Request, context: Context) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!elevated(sessionUser.role)) return NextResponse.json({ error: 'Only Admin, DEO, or DDEO users can delete schools.' }, { status: 403 })

  const { id } = await context.params
  const existing = await db.school.findUnique({ where: { id }, select: { id: true, emisCode: true, name: true } })
  if (!existing) return NextResponse.json({ error: 'School not found.' }, { status: 404 })

  const employeeCount = await db.employee.count({ where: { OR: [{ schoolId: existing.id }, { emisCode: existing.emisCode }] } })
  if (employeeCount > 0) {
    return NextResponse.json({ error: `Cannot delete ${existing.name} while ${employeeCount} employee record${employeeCount === 1 ? '' : 's'} is attached. Remove or reassign employees first.` }, { status: 409 })
  }

  await db.$transaction([
    db.user.deleteMany({ where: { emisCode: existing.emisCode, role: { equals: 'school admin', mode: 'insensitive' } } }),
    db.school.delete({ where: { id: existing.id } }),
  ])
  return NextResponse.json({ deleted: true, school: existing })
}
