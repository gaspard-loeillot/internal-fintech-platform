import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/platform/db'
import { getCurrentUser } from '@/platform/auth'
import PageHeader from '@/platform/PageHeader'
import StatusBadge from '@/platform/StatusBadge'
import {
  AuditTable,
  EmergencyOffAction,
  ENV_TONE,
  EnabledBadge,
  PendingRequestsTable,
  RequestChangeAction,
} from '../ui'

export const dynamic = 'force-dynamic'

export default async function FlagDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const user = await getCurrentUser()
  const flag = await prisma.featureFlag.findUnique({ where: { key: decodeURIComponent(key) } })
  if (!flag) notFound()

  const [pending, audit] = await Promise.all([
    prisma.featureFlagChangeRequest.findMany({
      where: { flagId: flag.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.featureFlagAudit.findMany({
      where: { flagId: flag.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  const flagsById = new Map([[flag.id, flag]])

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-block rounded text-sm text-blue-600 transition-all duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          ← All feature flags
        </Link>
        <PageHeader title={flag.name} description={flag.description} />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Flag</h2>
        <dl className="grid grid-cols-2 gap-6 rounded-lg border border-gray-200 p-6 sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Key</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">{flag.key}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Environment</dt>
            <dd className="mt-1">
              <StatusBadge tone={ENV_TONE[flag.environment] ?? 'neutral'} label={flag.environment} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">State</dt>
            <dd className="mt-1">
              <EnabledBadge enabled={flag.enabled} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Rollout</dt>
            <dd className="mt-1 text-sm tabular-nums text-gray-900">{flag.rollout}%</dd>
          </div>
        </dl>
        <div className="flex gap-2">
          {user.role === 'ops' && <RequestChangeAction flag={flag} />}
          {user.role === 'admin' && flag.enabled && flag.environment === 'prod' && (
            <EmergencyOffAction flag={flag} />
          )}
          {user.role === 'analyst' && (
            <p className="text-xs text-gray-500">
              Analysts have read-only access; switch to ops to request a change.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Pending change requests</h2>
        <PendingRequestsTable
          requests={pending}
          flagsById={flagsById}
          role={user.role}
          showFlag={false}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">Audit history</h2>
        <AuditTable entries={audit} flagsById={flagsById} showFlag={false} />
      </section>
    </div>
  )
}
