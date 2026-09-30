import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const elevatedRoles = new Set(['Admin', 'DEO', 'DDEO'])

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const asset = await db.asset.findUnique({ where: { id } })
  if (!asset) return NextResponse.json({ error: 'Asset not found.' }, { status: 404 })
  if (!elevatedRoles.has(user.role) && asset.emisCode !== user.emisCode) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await db.asset.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
