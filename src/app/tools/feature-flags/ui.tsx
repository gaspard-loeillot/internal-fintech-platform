import Link from 'next/link'
import type { FeatureFlag, FeatureFlagAudit, FeatureFlagChangeRequest } from '@prisma/client'
import type { Role } from '@/platform/auth'
import StatusBadge, { type Tone } from '@/platform/StatusBadge'
import ActionModal from '@/platform/ActionModal'
import ShortId from '@/platform/ShortId'
import Table from '@/platform/Table'
import prisma from '@/platform/db'
import { getCurrentUser } from '@/platform/auth'
import { TOOLS } from '@/platform/registry'
import { approveChangeRequest, emergencyOffFlag, rejectChangeRequest, requestFlagChange } from './actions'

export const ENV_TONE: Record<string, Tone> = { dev: 'neutral', staging: 'info', prod: 'warning' }
export const STATUS_TONE: Record<string, Tone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}
export const EVENT_LABEL: Record<string, string> = {
  change_requested: 'Change requested',
  change_approved: 'Change approved',
  change_rejected: 'Change rejected',
  'flag.emergency_off': 'Emergency off',
}

export function formatDate(date: Date) {
  return date.toISOString().replace('T', ' ').slice(0, 16)
}

// Compact one-line stamp for narrow table cells: 08-23 23:34
export function formatCompactDate(date: Date) {
  return date.toISOString().slice(5, 16).replace('T', ' ')
}

export function flagHref(flag: { key: string }) {
  return `/tools/feature-flags/${flag.key}`
}

// Features are the internal tools; a feature links to its page when it has one.
export function featureHref(feature: string) {
  return TOOLS.find((tool) => tool.name === feature)?.href ?? null
}

export function FeatureLink({ feature }: { feature: string }) {
  const href = featureHref(feature)
  if (!href) return <span className="text-gray-900">{feature}</span>
  return (
    <Link
      href={href}
      className="rounded text-blue-600 transition-all duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      {feature}
    </Link>
  )
}

export function EnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <StatusBadge tone={enabled ? 'success' : 'neutral'} label={enabled ? 'enabled' : 'disabled'} />
  )
}

export function RequestChangeAction({ flag }: { flag: FeatureFlag }) {
  return (
    <ActionModal
      triggerLabel={flag.enabled ? 'Request disable' : 'Request enable'}
      title="Request flag change"
      context={`${flag.key} (${flag.environment}): ${flag.enabled ? 'enabled' : 'disabled'} -> ${
        flag.enabled ? 'disabled' : 'enabled'
      }`}
      confirmLabel="Submit request"
      variant="primary"
      action={requestFlagChange.bind(null, flag.id, !flag.enabled)}
    />
  )
}

export function EmergencyOffAction({ flag }: { flag: FeatureFlag }) {
  return (
    <ActionModal
      triggerLabel="Emergency off"
      title="Emergency off"
      context={`${flag.key} (${flag.environment}) will be disabled immediately, with no approval step.`}
      confirmLabel="Disable now"
      variant="danger"
      action={emergencyOffFlag.bind(null, flag.id)}
    />
  )
}

function canEmergencyOff(flag: FeatureFlag, role: Role) {
  return role === 'admin' && flag.enabled && flag.environment === 'prod'
}

export function FlagsTable({ flags, role }: { flags: FeatureFlag[]; role: Role }) {
  return (
    <Table
      columns={[
        { header: 'Feature', sortable: true },
        { header: 'Key', sortable: true },
        { header: 'Name' },
        { header: 'Environment', sortable: true },
        { header: 'State' },
        { header: 'Rollout', align: 'right' },
        { header: 'Last updated', sortable: true },
        { header: 'Actions' },
      ]}
      empty="No feature flags yet."
      emptyHint="Seed the database with npm run db:reset."
      rows={flags.map((flag) => ({
        key: flag.id,
        sortValues: [
          flag.feature,
          flag.key,
          null,
          flag.environment,
          null,
          flag.rollout,
          flag.updatedAt.getTime(),
          null,
        ],
        cells: [
          <FeatureLink key="feature" feature={flag.feature} />,
          <span key="key" className="font-mono text-xs text-gray-900">
            {flag.key}
          </span>,
          <span key="name" className="text-gray-900">
            {flag.name}
          </span>,
          <StatusBadge key="env" tone={ENV_TONE[flag.environment] ?? 'neutral'} label={flag.environment} />,
          <EnabledBadge key="state" enabled={flag.enabled} />,
          <span key="rollout" className="text-gray-500">
            {flag.rollout}%
          </span>,
          <span key="updated" className="whitespace-nowrap text-xs text-gray-500">
            {formatCompactDate(flag.updatedAt)}
          </span>,
          <span key="actions" className="flex gap-2">
            {role === 'ops' ? (
              <RequestChangeAction flag={flag} />
            ) : (
              !canEmergencyOff(flag, role) && <span className="text-xs text-gray-500">ops only</span>
            )}
            {canEmergencyOff(flag, role) && <EmergencyOffAction flag={flag} />}
          </span>,
        ],
      }))}
    />
  )
}

// Flags owned by one feature, rendered below that feature's own data table.
export function FeatureFlagsTable({
  flags,
  pendingByFlagId,
  role,
}: {
  flags: FeatureFlag[]
  pendingByFlagId: Map<string, FeatureFlagChangeRequest>
  role: Role
}) {
  return (
    <Table
      columns={[
        { header: 'Key', sortable: true },
        { header: 'Name' },
        { header: 'Environment', sortable: true },
        { header: 'State' },
        { header: 'Rollout', align: 'right' },
        { header: 'Pending request' },
        { header: 'Actions' },
      ]}
      empty="No feature flags for this feature."
      emptyHint="Seed the database with npm run db:reset."
      rows={flags.map((flag) => {
        const pending = pendingByFlagId.get(flag.id)
        const context = pending
          ? `${flag.key} (${flag.environment}) -> ${
              pending.requestedEnabled ? 'enabled' : 'disabled'
            }, requested by ${pending.requestedByName}`
          : ''
        return {
          key: flag.id,
          sortValues: [flag.key, null, flag.environment, null, flag.rollout, null, null],
          cells: [
            <Link
              key="key"
              href={flagHref(flag)}
              className="rounded font-mono text-xs text-blue-600 transition-all duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {flag.key}
            </Link>,
            <span key="name" className="text-gray-900">
              {flag.name}
            </span>,
            <StatusBadge
              key="env"
              tone={ENV_TONE[flag.environment] ?? 'neutral'}
              label={flag.environment}
            />,
            <EnabledBadge key="state" enabled={flag.enabled} />,
            <span key="rollout" className="text-gray-500">
              {flag.rollout}%
            </span>,
            pending ? (
              <span key="pending" className="flex items-center gap-2">
                <StatusBadge tone="warning" label="pending" />
                <EnabledBadge enabled={pending.requestedEnabled} />
              </span>
            ) : (
              <span key="pending" className="text-xs text-gray-500">
                none
              </span>
            ),
            <span key="actions" className="flex gap-2">
              {role === 'ops' && !pending && <RequestChangeAction flag={flag} />}
              {role === 'admin' && pending && (
                <>
                  <ActionModal
                    triggerLabel="Approve"
                    title="Approve change request"
                    context={context}
                    confirmLabel="Approve"
                    variant="primary"
                    action={approveChangeRequest.bind(null, pending.id)}
                  />
                  <ActionModal
                    triggerLabel="Reject"
                    title="Reject change request"
                    context={context}
                    confirmLabel="Reject"
                    action={rejectChangeRequest.bind(null, pending.id)}
                  />
                </>
              )}
              {canEmergencyOff(flag, role) && <EmergencyOffAction flag={flag} />}
            </span>,
          ],
        }
      })}
    />
  )
}

// Drop-in section for a feature's own page.
export async function FeatureFlagsSection({ feature }: { feature: string }) {
  const user = await getCurrentUser()
  const flags = await prisma.featureFlag.findMany({
    where: { feature },
    orderBy: [{ environment: 'asc' }, { key: 'asc' }],
  })
  const pending = await prisma.featureFlagChangeRequest.findMany({
    where: { status: 'pending', flagId: { in: flags.map((flag) => flag.id) } },
    orderBy: { createdAt: 'desc' },
  })
  // Newest pending request wins when a flag has more than one.
  const pendingByFlagId = new Map<string, FeatureFlagChangeRequest>()
  for (const request of pending) {
    if (!pendingByFlagId.has(request.flagId)) pendingByFlagId.set(request.flagId, request)
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">Feature flags</h2>
      <p className="text-sm text-gray-500">
        Flags that belong to {feature}. Same request and approval rules as the flags home page.
      </p>
      <FeatureFlagsTable flags={flags} pendingByFlagId={pendingByFlagId} role={user.role} />
    </section>
  )
}

export function PendingRequestsTable({
  requests,
  flagsById,
  role,
  showFlag = true,
}: {
  requests: FeatureFlagChangeRequest[]
  flagsById: Map<string, FeatureFlag>
  role: Role
  showFlag?: boolean
}) {
  return (
    <Table
      columns={[
        { header: 'Request ID' },
        ...(showFlag ? [{ header: 'Flag', sortable: true }] : []),
        { header: 'Requested state' },
        { header: 'Requested by', sortable: true },
        { header: 'Reason' },
        { header: 'Status' },
        { header: 'Decision' },
      ]}
      empty="No pending change requests."
      emptyHint="Switch to the ops identity and request a flag change."
      rows={requests.map((request) => {
        const flag = flagsById.get(request.flagId)
        const context = `${flag?.key ?? request.flagId} (${flag?.environment ?? '?'}) -> ${
          request.requestedEnabled ? 'enabled' : 'disabled'
        }, requested by ${request.requestedByName}`
        return {
          key: request.id,
          sortValues: showFlag
            ? [null, flag?.key ?? request.flagId, null, request.requestedByName, null, null, null]
            : [null, null, request.requestedByName, null, null, null],
          cells: [
            <ShortId key="id" id={request.id} />,
            ...(showFlag
              ? [
                  <span key="flag" className="font-mono text-xs text-gray-900">
                    {flag?.key ?? request.flagId}
                  </span>,
                ]
              : []),
            <EnabledBadge key="state" enabled={request.requestedEnabled} />,
            <span key="by" className="text-gray-900">
              {request.requestedByName}
              <span className="block text-xs text-gray-500">{request.requestedByRole}</span>
            </span>,
            <span key="reason" className="text-xs text-gray-500">
              {request.reason}
            </span>,
            <StatusBadge key="status" tone={STATUS_TONE[request.status] ?? 'neutral'} label={request.status} />,
            role === 'admin' ? (
              <span key="decision" className="flex gap-2">
                <ActionModal
                  triggerLabel="Approve"
                  title="Approve change request"
                  context={context}
                  confirmLabel="Approve"
                  variant="primary"
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
              <span key="decision" className="text-xs text-gray-500">
                admin only
              </span>
            ),
          ],
        }
      })}
    />
  )
}

export function AuditTable({
  entries,
  flagsById,
  showFlag = true,
}: {
  entries: FeatureFlagAudit[]
  flagsById: Map<string, FeatureFlag>
  showFlag?: boolean
}) {
  return (
    <Table
      columns={[
        { header: 'Event ID' },
        { header: 'Request ID' },
        { header: 'When', sortable: true },
        { header: 'Event' },
        ...(showFlag ? [{ header: 'Flag' }] : []),
        { header: 'Actor' },
        { header: 'Reason' },
      ]}
      empty="No audit entries yet."
      emptyHint="Requests and decisions are recorded here as they happen."
      rows={entries.map((entry) => ({
        key: entry.id,
        sortValues: showFlag
          ? [null, null, entry.createdAt.getTime(), null, null, null, null]
          : [null, null, entry.createdAt.getTime(), null, null, null],
        cells: [
          <ShortId key="id" id={entry.id} />,
          <ShortId key="request" id={entry.requestId} />,
          <span key="when" className="text-xs text-gray-500">
            {formatDate(entry.createdAt)}
          </span>,
          <span key="event" className="text-gray-900">
            {entry.event === 'flag.emergency_off' ? (
              <StatusBadge tone="danger" label={EVENT_LABEL[entry.event]} />
            ) : (
              (EVENT_LABEL[entry.event] ?? entry.event)
            )}
          </span>,
          ...(showFlag
            ? [
                <span key="flag" className="font-mono text-xs text-gray-900">
                  {flagsById.get(entry.flagId)?.key ?? entry.flagId}
                </span>,
              ]
            : []),
          <span key="actor" className="text-gray-900">
            {entry.actorName}
            <span className="block text-xs text-gray-500">{entry.actorRole}</span>
          </span>,
          <span key="reason" className="text-xs text-gray-500">
            {entry.reason ?? '-'}
          </span>,
        ],
      }))}
    />
  )
}
