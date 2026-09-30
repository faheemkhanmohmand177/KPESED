import { cookies } from 'next/headers'
import { getUserById, toSafeUser } from '@/lib/user-store'

// NOTE: This is a demo-only signed-cookie session helper.
// For production, use iron-session / JWT / NextAuth.js with proper secret.
// DO NOT use this naive base64 scheme in real deployments.

const COOKIE_NAME = 'hrmis_session'
const SECRET = process.env.HRMIS_SESSION_SECRET || 'kese-hrmis-demo-secret-2024'

export interface SafeUser {
  id: string
  username: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  avatarUrl: string | null
  isActive: boolean
  emisCode: string | null
}

// Simple XOR-based signing (not cryptographic — demo only)
function sign(payload: string): string {
  const sig = simpleHmac(payload, SECRET)
  return Buffer.from(JSON.stringify({ p: payload, s: sig })).toString('base64')
}

function unsign(token: string): string | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    if (typeof decoded?.p !== 'string' || typeof decoded?.s !== 'string') return null
    const expected = simpleHmac(decoded.p, SECRET)
    if (expected !== decoded.s) return null
    return decoded.p
  } catch {
    return null
  }
}

function simpleHmac(msg: string, key: string): string {
  // Lightweight non-cryptographic hash — do NOT use for security.
  let h1 = 0xdeadbeef ^ key.length
  let h2 = 0x41c6ce57 ^ key.length
  for (let i = 0; i < msg.length; i++) {
    const ch = msg.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const out = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return out.toString(16)
}

export async function setSessionCookie(userId: string): Promise<void> {
  const expires = Date.now() + 1000 * 60 * 60 * 12 // 12h
  const payload = JSON.stringify({ id: userId, exp: expires })
  const token = sign(payload)
  const c = await cookies()
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies()
  c.delete(COOKIE_NAME)
}

/**
 * Get the current authenticated user from the session cookie.
 * Works with BOTH Supabase (production) and Prisma+SQLite (local dev).
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const c = await cookies()
    const token = c.get(COOKIE_NAME)?.value
    if (!token) return null
    const payload = unsign(token)
    if (!payload) return null
    const data = JSON.parse(payload) as { id: string; exp: number }
    if (!data.id || typeof data.id !== 'string') return null
    if (data.exp && Date.now() > data.exp) return null
    const user = await getUserById(data.id)
    if (!user || !user.isActive) return null
    return toSafeUser(user)
  } catch {
    return null
  }
}

export function requireRole(user: SafeUser | null, ...roles: string[]): SafeUser {
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  if (roles.length && !roles.includes(user.role)) {
    throw new Error('FORBIDDEN')
  }
  return user
}

export const SESSION_COOKIE = COOKIE_NAME
