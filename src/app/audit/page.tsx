import prisma from '@/platform/db'

export const dynamic = 'force-dynamic'

const EVENT_LABEL: Record<string, string> = {
  change_requested: 'Change requested',
  change_approved: 'Change approved',
  change_rejected: 'Change rejected',
}

function formatDate(date: Date) {
  return date.toISOString().replace('T', ' ').slice(0, 16)
}

export default async function AuditPage() {
  const [entries, flags] = await Promise.all([
    prisma.featureFlagAudit.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.featureFlag.findMany(),
  ])
  const flagById = new Map(flags.map((flag) => [flag.id, flag]))

  return (
    <div>
      <h1 className="text-xl font-semibold">Audit history</h1>
      <p className="mt-1 text-sm text-gray-600">
        Every feature-flag request and decision recorded in the local database.
      </p>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th className="py-2 pr-3">When</th>
            <th className="py-2 pr-3">Event</th>
            <th className="py-2 pr-3">Flag</th>
            <th className="py-2 pr-3">Actor</th>
            <th className="py-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-gray-200 align-top">
              <td className="py-2 pr-3 text-xs text-gray-500">{formatDate(entry.createdAt)}</td>
              <td className="py-2 pr-3">{EVENT_LABEL[entry.event] ?? entry.event}</td>
              <td className="py-2 pr-3 font-mono text-xs">
                {flagById.get(entry.flagId)?.key ?? entry.flagId}
              </td>
              <td className="py-2 pr-3">
                {entry.actorName}
                <div className="text-xs text-gray-500">{entry.actorRole}</div>
              </td>
              <td className="py-2 text-xs text-gray-600">{entry.reason ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
