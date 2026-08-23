import prisma from '../src/platform/db'

// Shared date helpers — every seed block uses these; never redefine them.
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000)
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600_000)
const hoursFromNow = (n: number) => new Date(Date.now() + n * 3600_000)

async function main() {
  // ── chassis seed (S1) ──

  // ── tool:kyc-review ──

  // ── tool:refunds ──

  // ── tool:feature-flags ──
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
