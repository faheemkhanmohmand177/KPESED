import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, context: Context) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  const body = await req.json().catch(() => null)
  const data = body?.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : undefined
  const title = typeof body?.title === 'string' ? body.title.trim() : undefined
  const record = await db.portalRecord.update({ where: { id }, data: { ...(data ? { data } : {}), ...(title !== undefined ? { title } : {}) } })
  return NextResponse.json({ record })
}

export async function DELETE(_req: Request, context: Context) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  await db.portalRecord.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
