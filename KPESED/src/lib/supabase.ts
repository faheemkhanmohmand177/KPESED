/**
 * Supabase Client — Production Backend Integration
 *
 * This file provides a Supabase client wrapper that the production deployment
 * uses instead of Prisma+SQLite. Configure with env vars:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * The local dev environment uses Prisma (see lib/db.ts), so this file is a
 * no-op stub until the project is wired to a real Supabase instance.
 */

import type { Database } from '@/types/supabase'

export type SupabaseEnv = {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

function readEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return {
    url,
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

/**
 * Returns a Supabase browser client (uses anon key, respects RLS).
 * Returns null if env vars are missing — caller should fall back to Prisma.
 */
export async function getSupabaseBrowserClient() {
  const env = readEnv()
  if (!env) return null
  const { createClient } = await import('@supabase/supabase-js')
  return createClient<Database>(env.url, env.anonKey)
}

/**
 * Returns a Supabase server client (uses service role key — bypasses RLS).
 * Server-side only. Returns null if env vars are missing.
 */
export async function getSupabaseServerClient() {
  const env = readEnv()
  if (!env?.serviceRoleKey) return null
  const { createClient } = await import('@supabase/supabase-js')
  return createClient<Database>(env.url, env.serviceRoleKey)
}

/**
 * Checks if the Supabase backend is configured.
 */
export function isSupabaseConfigured(): boolean {
  return readEnv() !== null
}
