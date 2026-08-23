import { PrismaClient } from '@prisma/client'

// NOTE: no `import 'server-only'` here — prisma/seed.ts runs this file under
// tsx, where server-only throws. Other server-side platform modules and all
// queries.ts files DO use server-only; db.ts is the one deliberate exemption.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
