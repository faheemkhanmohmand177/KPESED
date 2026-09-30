import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/notifications — returns notifications for the current user
// POST /api/notifications — creates a notification (admin only)
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  const unread = await db.notification.count({
    where: { userId: user.id, isRead: false },
  })
  return NextResponse.json({ notifications, unread })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const title = String(body?.title ?? '').trim()
  const message = String(body?.message ?? '').trim()
  if (!title || !message) {
    return NextResponse.json({ error: 'title and message required' }, { status: 400 })
  }
  const notification = await db.notification.create({
    data: {
      userId: user.id,
      title,
      message,
      type: String(body?.type ?? 'info'),
      category: body?.category ? String(body.category) : null,
      link: body?.link ? String(body.link) : null,
    },
  })
  return NextResponse.json({ notification })
}
