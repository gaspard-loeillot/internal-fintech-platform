import prisma from '@/platform/db'
import { getCurrentUser } from '@/platform/auth'
import PageHeader from '@/platform/PageHeader'
import { AuditTable, FlagsTable, PendingRequestsTable } from './tools/feature-flags/ui'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getCurrentUser()
  const [flags, pending, audit] = await Promise.all([
    prisma.featureFlag.findMany({ orderBy: [{ environment: 'asc' }, { key: 'asc' }] }),
    prisma.featureFlagChangeRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.featureFlagAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ])
  const flagsById = new Map(flags.map((flag) => [flag.id, flag]))

  return (
    <div className="space-y-10">
      <PageHeader
        title="Feature Flags"
        description="Ops requests flag changes; admin approves or rejects them. Fake data, demo identities."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Flags</h2>
        <FlagsTable flags={flags} role={user.role} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Pending change requests</h2>
        <PendingRequestsTable requests={pending} flagsById={flagsById} role={user.role} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Audit history</h2>
        <AuditTable entries={audit} flagsById={flagsById} />
      </section>
    </div>
  )
}
