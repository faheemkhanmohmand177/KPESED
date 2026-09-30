import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { changeUserPassword } from '@/lib/user-store'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''
  if (!currentPassword || newPassword.length < 8) return NextResponse.json({ error: 'Current password and an 8-character new password are required.' }, { status: 400 })
  const changed = await changeUserPassword(user.id, currentPassword, newPassword)
  if (!changed) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
