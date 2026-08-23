import prisma from '@/platform/db'
import PageHeader from '@/platform/PageHeader'
import { AuditTable } from '../tools/feature-flags/ui'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const [entries, flags] = await Promise.all([
    prisma.featureFlagAudit.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.featureFlag.findMany(),
  ])
  const flagsById = new Map(flags.map((flag) => [flag.id, flag]))

  return (
    <div className="space-y-10">
      <PageHeader
        title="Audit history"
        description="Every feature-flag request and decision recorded in the local database."
      />
      <AuditTable entries={entries} flagsById={flagsById} />
    </div>
  )
}
