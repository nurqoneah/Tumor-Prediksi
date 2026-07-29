import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In Next.js, Prisma Client sometimes doesn't see the DATABASE_URL environment variable
// during HMR compile or within Turbopack threads. Passing the datasource URL explicitly
// from process.env solves environment loading issues locally and in production.
const databaseUrl = process.env.DATABASE_URL || "file:../db/custom.db";

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db