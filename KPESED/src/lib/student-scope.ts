import { getCurrentUser } from '@/lib/auth'

export async function getStudentScope() {
  const user = await getCurrentUser()
  if (!user) return { user: null, emisCode: null as string | null }
  const scoped = user.role.trim().toLowerCase() === 'school admin'
  return { user, emisCode: scoped ? (user.emisCode?.trim() || null) : null }
}

export function scopedWhere(emisCode: string | null) {
  return emisCode ? { emisCode } : {}
}

export function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const result = String(value).trim()
  return result || null
}

export function cleanDate(value: unknown): Date | null {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export function scopeError(emisCode: string | null) {
  return emisCode ? 'Your account is not assigned to a school.' : 'Unauthorized'
}
