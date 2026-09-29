import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const moduleKey = url.searchParams.get('module')?.trim()
  if (!moduleKey) return NextResponse.json({ error: 'module is required' }, { status: 400 })
  const search = url.searchParams.get('search')?.trim().toLowerCase() || ''
  const rows = await db.portalRecord.findMany({ where: { moduleKey }, orderBy: { updatedAt: 'desc' }, take: 1000 })
  const filtered = search ? rows.filter((row) => JSON.stringify(row.data).toLowerCase().includes(search) || (row.title || '').toLowerCase().includes(search)) : rows
  return NextResponse.json({ total: filtered.length, records: filtered })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const moduleKey = typeof body?.moduleKey === 'string' ? body.moduleKey.trim() : ''
  const title = typeof body?.title === 'string' ? body.title.trim() : null
  const data = body?.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : null
  if (!moduleKey || !data) return NextResponse.json({ error: 'moduleKey and an object data payload are required' }, { status: 400 })
  const record = await db.portalRecord.create({ data: { moduleKey, title, data, createdById: user.id } })
  return NextResponse.json({ record }, { status: 201 })
}
