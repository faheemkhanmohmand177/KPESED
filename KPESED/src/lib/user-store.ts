/**
 * Unified User Store — works with BOTH Supabase (production) and Prisma+SQLite (local dev).
 *
 * - If NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, uses Supabase.
 * - Otherwise, falls back to Prisma (local SQLite dev DB).
 *
 * This is the single source of truth for user lookups across the app —
 * the login route, getCurrentUser, and any other code that needs the user
 * table should call these helpers instead of using Prisma or Supabase directly.
 */

import { db } from '@/lib/db'
import type { SafeUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export interface UserRecord {
  id: string
  username: string
  password: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  avatarUrl: string | null
  isActive: boolean
  emisCode?: string | null
  schoolName?: string | null
  district?: string | null
  lastLogin?: Date | null
}

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return { url, serviceKey }
}

async function getSupabaseAdmin() {
  const env = getSupabaseEnv()
  if (!env) return null
  const { createClient } = await import('@supabase/supabase-js')
  // Use service role key — bypasses RLS for server-side admin operations
  return createClient(env.url, env.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Map a Supabase users row (snake_case) to our UserRecord (camelCase). */
function mapRow(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id ?? ''),
    username: String(row.username ?? ''),
    password: String(row.password ?? ''),
    fullName: String(row.full_name ?? row.fullName ?? ''),
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    role: String(row.role ?? 'school admin'),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : (row.avatarUrl ? String(row.avatarUrl) : null),
    isActive: row.is_active !== false && row.isActive !== false,
    emisCode: row.emis_code ? String(row.emis_code) : (row.emisCode ? String(row.emisCode) : null),
    schoolName: row.school_name ? String(row.school_name) : (row.schoolName ? String(row.schoolName) : null),
    district: row.district ? String(row.district) : null,
    lastLogin: row.last_login ? new Date(String(row.last_login)) : null,
  }
}

/** Convert UserRecord to SafeUser (no password). */
export function toSafeUser(u: UserRecord): SafeUser {
  return {
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
    emisCode: u.emisCode ?? null,
  }
}

/**
 * Find a user by username.
 * Uses Supabase if env vars are configured, otherwise Prisma.
 */
export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const supabase = await getSupabaseAdmin()
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle()
    if (error) {
      console.error('[supabase] getUserByUsername error:', error.message)
      return null
    }
    if (!data) return null
    return mapRow(data as Record<string, unknown>)
  }
  // Fallback: Prisma
  const user = await db.user.findUnique({ where: { username } })
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    password: user.password,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    emisCode: user.emisCode,
    schoolName: user.schoolName,
    district: user.district,
    lastLogin: user.lastLogin,
  }
}

/**
 * Find a user by ID.
 * Uses Supabase if env vars are configured, otherwise Prisma.
 */
export async function getUserById(id: string): Promise<UserRecord | null> {
  const supabase = await getSupabaseAdmin()
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) {
      console.error('[supabase] getUserById error:', error.message)
      return null
    }
    if (!data) return null
    return mapRow(data as Record<string, unknown>)
  }
  // Fallback: Prisma
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    password: user.password,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    emisCode: user.emisCode,
    schoolName: user.schoolName,
    district: user.district,
    lastLogin: user.lastLogin,
  }
}

/**
 * Update lastLogin timestamp.
 * Best-effort — ignores errors (read-only DB in some environments).
 */
export async function stampLastLogin(userId: string): Promise<void> {
  const supabase = await getSupabaseAdmin()
  if (supabase) {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
    return
  }
  try {
    await db.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    })
  } catch {
    // non-fatal
  }
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) return false
  const password = await bcrypt.hash(newPassword, 10)
  const supabase = await getSupabaseAdmin()
  if (supabase) {
    const { error } = await supabase.from('users').update({ password, updated_at: new Date().toISOString() }).eq('id', userId)
    return !error
  }
  await db.user.update({ where: { id: userId }, data: { password } })
  return true
}
