import prisma from '@/platform/db'
import PageHeader from '@/platform/PageHeader'
import { buttonSecondary, buttonSmall } from '@/platform/buttons'
import { AuditTable } from '../tools/feature-flags/ui'

export const dynamic = 'force-dynamic'

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ flag?: string }>
}) {
  const { flag } = await searchParams
  const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } })
  const active = flags.find((row) => row.key === flag)
  const entries = await prisma.featureFlagAudit.findMany({
    where: active ? { flagId: active.id } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  const flagsById = new Map(flags.map((row) => [row.id, row]))

  return (
    <div className="space-y-10">
      <PageHeader
        title="Audit history"
        description="Every feature-flag request and decision recorded in the local database."
      />

      <form method="get" className="flex items-center gap-2 text-sm">
        <label htmlFor="flag" className="text-gray-500">
          Flag
        </label>
        <select
          id="flag"
          name="flag"
          defaultValue={active?.key ?? ''}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <option value="">All</option>
          {flags.map((row) => (
            <option key={row.id} value={row.key}>
              {row.key}
            </option>
          ))}
        </select>
        <button type="submit" className={`${buttonSecondary} ${buttonSmall}`}>
          Filter
        </button>
      </form>

      <AuditTable entries={entries} flagsById={flagsById} />
    </div>
  )
}
