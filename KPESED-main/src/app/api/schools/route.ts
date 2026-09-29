import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getUserById } from '@/lib/user-store'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

const elevated = (role: string) => ['admin', 'deo', 'ddeo'].includes(role.trim().toLowerCase())

async function scopedUser() {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) return null
  return { sessionUser, record: await getUserById(sessionUser.id) }
}

export async function GET() {
  const scope = await scopedUser()
  if (!scope) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const where = scope.sessionUser.role.toLowerCase() === 'school admin' && scope.record?.emisCode ? { emisCode: scope.record.emisCode } : {}
  const schools = await db.school.findMany({ where, orderBy: { name: 'asc' }, include: { district: true, tehsil: true } })
  return NextResponse.json({ schools })
}

export async function POST(req: Request) {
  const scope = await scopedUser()
  if (!scope) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!elevated(scope.sessionUser.role)) return NextResponse.json({ error: 'Only Admin, DEO, or DDEO users can add schools.' }, { status: 403 })
  const body = await req.json().catch(() => null)
  const emisCode = String(body?.emisCode || '').trim()
  const name = String(body?.name || '').trim()
  if (!emisCode || !name) return NextResponse.json({ error: 'EMIS code and school name are required.' }, { status: 400 })
  const requestedUsername = String(body?.loginUsername || '').trim()
  const requestedPassword = String(body?.loginPassword || '')
  if (requestedUsername && !requestedPassword) return NextResponse.json({ error: 'Enter a temporary password when creating a school login.' }, { status: 400 })
  if (requestedPassword && !requestedUsername) return NextResponse.json({ error: 'Enter a username when creating a school login.' }, { status: 400 })
  if (requestedPassword && requestedPassword.length < 8) return NextResponse.json({ error: 'Temporary password must be at least 8 characters.' }, { status: 400 })
  if (requestedUsername && requestedUsername.length < 3) return NextResponse.json({ error: 'School login username must be at least 3 characters.' }, { status: 400 })
  try {
    const result = await db.$transaction(async (tx) => {
      const school = await tx.school.create({ data: {
        emisCode, name, schoolType: body.schoolType || null, gender: body.gender || null, ddoCode: body.ddoCode || null,
        districtId: body.districtId || null, tehsilId: body.tehsilId || null, address: body.address || null,
        establishedYear: body.establishedYear ? Number(body.establishedYear) : null,
      } })
      let login: { username: string; temporaryPassword: string } | null = null
      if (requestedUsername && requestedPassword) {
        const user = await tx.user.create({ data: { username: requestedUsername, password: await bcrypt.hash(requestedPassword, 10), fullName: name, role: 'school admin', emisCode, schoolName: name, district: body.districtName || null } })
        login = { username: user.username, temporaryPassword: requestedPassword }
      }
      return { school, login }
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('school create error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const fields = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'the submitted value'
      const fieldMessage = fields.includes('emis_code') ? 'EMIS code' : fields.includes('username') ? 'username' : fields
      return NextResponse.json({ error: `A school or login with this ${fieldMessage} already exists. Use a different value.` }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not create school. Please check the school details and try again.' }, { status: 400 })
  }
}
