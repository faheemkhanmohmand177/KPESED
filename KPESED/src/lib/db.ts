import { PrismaClient } from '@prisma/client'

// Prisma client for KPESE HRMIS.
//
// In production we share a single client across requests via globalThis.
// In development we DO NOT cache via globalThis — the underlying SQLite file
// can be replaced (e.g. by `prisma db push` or the seed script) which leaves
// a "deleted" inode open in the dev server. By re-instantiating on each
// module reload we ensure Prisma re-resolves the path and picks up the
// latest inode + data.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isProd = process.env.NODE_ENV === 'production'

function createClient(): PrismaClient {
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

export const db = isProd
  ? (globalForPrisma.prisma ?? createClient())
  : createClient()

if (isProd) {
  globalForPrisma.prisma = db
}
