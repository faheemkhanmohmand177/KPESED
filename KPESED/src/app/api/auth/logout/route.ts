import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

// POST /api/auth/logout — clears the session cookie
export async function POST() {
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
