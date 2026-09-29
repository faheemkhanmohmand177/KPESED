import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/auth'
import { getUserByUsername, stampLastLogin, toSafeUser } from '@/lib/user-store'
import bcrypt from 'bcryptjs'

// POST /api/auth/login
// Body: { username, password }
// Returns: { user: SafeUser } on success, 401 on failure
//
// This route works with BOTH Supabase (production) and Prisma+SQLite (local dev).
// The user-store helper auto-detects which backend to use based on env vars.
//
// Login endpoint for the Integrated EMIS portal.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const username = String(body?.username ?? '').trim()
    const password = String(body?.password ?? '')
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }
    const user = await getUserByUsername(username)
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    // Best-effort lastLogin stamp — ignore errors (read-only DB connection in
    // some sandboxed dev environments).
    await stampLastLogin(user.id)
    await setSessionCookie(user.id)
    return NextResponse.json({ user: toSafeUser(user) })
  } catch (e) {
    console.error('login error', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
