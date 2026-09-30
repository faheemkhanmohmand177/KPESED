import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/portal-records/seed-defaults
 * Body: { moduleKey, rows: Array<Record<string, string>> }
 *
 * Seeds the editable-grid default rows for a module (Tree Survey species,
 * PTC headwise heads) once, when the module has no records yet. Idempotent:
 * skips seeding when any record already exists for the module.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const moduleKey = typeof body?.moduleKey === 'string' ? body.moduleKey.trim() : ''
  const rows = Array.isArray(body?.rows) ? body.rows : null
  if (!moduleKey || !rows?.length) {
    return NextResponse.json({ error: 'moduleKey and rows are required' }, { status: 400 })
  }
  if (rows.length > 200) {
    return NextResponse.json({ error: 'rows exceeds the maximum of 200' }, { status: 400 })
  }
  const existing = await db.portalRecord.findFirst({ where: { moduleKey }, select: { id: true } })
  if (existing) return NextResponse.json({ seeded: 0, reason: 'already has records' })
  const created = await db.portalRecord.createMany({
    data: rows.map((row) => ({
      moduleKey,
      data: row && typeof row === 'object' && !Array.isArray(row) ? row : {},
      createdById: user.id,
    })),
  })
  return NextResponse.json({ seeded: created.count })
}
