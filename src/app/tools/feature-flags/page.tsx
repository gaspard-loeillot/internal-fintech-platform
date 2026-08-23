import prisma from '@/platform/db'
import { getCurrentUser } from '@/platform/auth'
import StatusBadge, { type Tone } from '@/platform/StatusBadge'
import ActionModal from '@/platform/ActionModal'
import { approveChangeRequest, rejectChangeRequest, requestFlagChange } from './actions'

export const dynamic = 'force-dynamic'

const ENV_TONE: Record<string, Tone> = { dev: 'neutral', staging: 'info', prod: 'warning' }
const STATUS_TONE: Record<string, Tone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}
const EVENT_LABEL: Record<string, string> = {
  change_requested: 'Change requested',
  change_approved: 'Change approved',
  change_rejected: 'Change rejected',
}

function formatDate(date: Date) {
  return date.toISOString().replace('T', ' ').slice(0, 16)
}

export default async function FeatureFlagsPage() {
  const user = await getCurrentUser()
  const [flags, pending, audit] = await Promise.all([
    prisma.featureFlag.findMany({ orderBy: [{ environment: 'asc' }, { key: 'asc' }] }),
    prisma.featureFlagChangeRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.featureFlagAudit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ])
  const flagById = new Map(flags.map((flag) => [flag.id, flag]))

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Feature Flags</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ops requests flag changes; admin approves or rejects them. Fake data, demo identities.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium">Flags</h2>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-3">Key</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Environment</th>
              <th className="py-2 pr-3">State</th>
              <th className="py-2 pr-3">Updated</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-b border-gray-200 align-top">
                <td className="py-2 pr-3 font-mono text-xs">{flag.key}</td>
                <td className="py-2 pr-3">
                  {flag.name}
                  <div className="text-xs text-gray-500">{flag.description}</div>
                </td>
                <td className="py-2 pr-3">
                  <StatusBadge tone={ENV_TONE[flag.environment] ?? 'neutral'} label={flag.environment} />
                </td>
                <td className="py-2 pr-3">
                  <StatusBadge
                    tone={flag.enabled ? 'success' : 'neutral'}
                    label={flag.enabled ? 'enabled' : 'disabled'}
                  />
                </td>
                <td className="py-2 pr-3 text-xs text-gray-500">{formatDate(flag.updatedAt)}</td>
                <td className="py-2">
                  {user.role === 'ops' ? (
                    <ActionModal
                      triggerLabel={flag.enabled ? 'Request disable' : 'Request enable'}
                      title="Request flag change"
                      context={`${flag.key} (${flag.environment}): ${
                        flag.enabled ? 'enabled' : 'disabled'
                      } -> ${flag.enabled ? 'disabled' : 'enabled'}`}
                      confirmLabel="Submit request"
                      action={requestFlagChange.bind(null, flag.id, !flag.enabled)}
                    />
                  ) : (
                    <span className="text-xs text-gray-500">ops only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-medium">Pending change requests</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">No pending requests.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left">
                <th className="py-2 pr-3">Flag</th>
                <th className="py-2 pr-3">Requested state</th>
                <th className="py-2 pr-3">Requested by</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Decision</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((request) => {
                const flag = flagById.get(request.flagId)
                const context = `${flag?.key ?? request.flagId} (${flag?.environment ?? '?'}) -> ${
                  request.requestedEnabled ? 'enabled' : 'disabled'
                }, requested by ${request.requestedByName}`
                return (
                  <tr key={request.id} className="border-b border-gray-200 align-top">
                    <td className="py-2 pr-3 font-mono text-xs">{flag?.key ?? request.flagId}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge
                        tone={request.requestedEnabled ? 'success' : 'neutral'}
                        label={request.requestedEnabled ? 'enabled' : 'disabled'}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      {request.requestedByName}
                      <div className="text-xs text-gray-500">{request.requestedByRole}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-gray-600">{request.reason}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge tone={STATUS_TONE[request.status] ?? 'neutral'} label={request.status} />
                    </td>
                    <td className="py-2">
                      {user.role === 'admin' ? (
                        <span className="flex gap-2">
                          <ActionModal
                            triggerLabel="Approve"
                            title="Approve change request"
                            context={context}
                            confirmLabel="Approve"
                            action={approveChangeRequest.bind(null, request.id)}
                          />
                          <ActionModal
                            triggerLabel="Reject"
                            title="Reject change request"
                            context={context}
                            confirmLabel="Reject"
                            action={rejectChangeRequest.bind(null, request.id)}
                          />
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">admin only</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium">Audit history</h2>
        <table className="mt-2 w-full border-collapse text-sm">
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
            {audit.map((entry) => (
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
      </section>
    </div>
  )
}
