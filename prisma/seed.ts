import prisma from '../src/platform/db'

// Shared date helpers — every seed block uses these; never redefine them.
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000)
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600_000)
const hoursFromNow = (n: number) => new Date(Date.now() + n * 3600_000)

async function main() {
  // ── chassis seed (S1) ──
  // Fixed demo identities, mirroring src/platform/auth.ts (no import: that
  // module is server-only and cannot run under tsx).
  const DEMO_USERS = {
    analyst: { id: 'user-analyst', name: 'Stephen Curry', role: 'analyst' },
    ops: { id: 'user-ops', name: 'Austin Reaves', role: 'ops' },
    admin: { id: 'user-admin', name: 'Lebron James', role: 'admin' },
  }

  // ── tool:kyc-review ──

  // ── tool:refunds ──

  // ── tool:feature-flags ──
  const flagSeeds = [
    {
      key: 'instant_payouts',
      name: 'Instant payouts',
      description: 'Pay merchants out within minutes instead of nightly batches.',
      enabled: true,
      environment: 'dev',
    },
    {
      key: 'instant_payouts_prod',
      name: 'Instant payouts (prod)',
      description: 'Production rollout of instant payouts.',
      enabled: false,
      environment: 'prod',
    },
    {
      key: 'new_refund_ui',
      name: 'New refund UI',
      description: 'Redesigned refund review screen for the ops team.',
      enabled: true,
      environment: 'staging',
    },
    {
      key: 'kyc_auto_clear',
      name: 'KYC auto-clear',
      description: 'Auto-clear low-risk KYC cases without manual review.',
      enabled: false,
      environment: 'staging',
    },
    {
      key: 'fraud_scoring_v2',
      name: 'Fraud scoring v2',
      description: 'Second-generation transaction fraud scoring model.',
      enabled: true,
      environment: 'prod',
    },
    {
      key: 'sandbox_rate_limits',
      name: 'Sandbox rate limits',
      description: 'Apply per-key rate limits in the sandbox environment.',
      enabled: false,
      environment: 'dev',
    },
    {
      key: 'ledger_read_replica',
      name: 'Ledger read replica',
      description: 'Serve ledger reads from the replica database.',
      enabled: true,
      environment: 'prod',
    },
  ]

  const flags: Record<string, { id: string }> = {}
  for (const flag of flagSeeds) {
    const created = await prisma.featureFlag.create({ data: flag })
    flags[flag.key] = created
  }

  // Camera-ready pending request: created by ops, so admin can approve it live.
  const pending = await prisma.featureFlagChangeRequest.create({
    data: {
      flagId: flags.instant_payouts_prod.id,
      requestedEnabled: true,
      reason: 'Instant payouts passed staging soak test; enable for the pilot merchants.',
      status: 'pending',
      requestedById: DEMO_USERS.ops.id,
      requestedByName: DEMO_USERS.ops.name,
      requestedByRole: DEMO_USERS.ops.role,
      createdAt: hoursAgo(3),
    },
  })
  await prisma.featureFlagAudit.create({
    data: {
      event: 'change_requested',
      flagId: pending.flagId,
      requestId: pending.id,
      actorId: DEMO_USERS.ops.id,
      actorName: DEMO_USERS.ops.name,
      actorRole: DEMO_USERS.ops.role,
      reason: pending.reason,
      createdAt: hoursAgo(3),
    },
  })

  const secondPending = await prisma.featureFlagChangeRequest.create({
    data: {
      flagId: flags.sandbox_rate_limits.id,
      requestedEnabled: true,
      reason: 'Sandbox abuse from a single API key; turn on rate limits.',
      status: 'pending',
      requestedById: DEMO_USERS.ops.id,
      requestedByName: DEMO_USERS.ops.name,
      requestedByRole: DEMO_USERS.ops.role,
      createdAt: hoursAgo(20),
    },
  })
  await prisma.featureFlagAudit.create({
    data: {
      event: 'change_requested',
      flagId: secondPending.flagId,
      requestId: secondPending.id,
      actorId: DEMO_USERS.ops.id,
      actorName: DEMO_USERS.ops.name,
      actorRole: DEMO_USERS.ops.role,
      reason: secondPending.reason,
      createdAt: hoursAgo(20),
    },
  })

  const approved = await prisma.featureFlagChangeRequest.create({
    data: {
      flagId: flags.new_refund_ui.id,
      requestedEnabled: true,
      reason: 'Ops sign-off complete; enable the new refund UI in staging.',
      status: 'approved',
      requestedById: DEMO_USERS.ops.id,
      requestedByName: DEMO_USERS.ops.name,
      requestedByRole: DEMO_USERS.ops.role,
      decidedById: DEMO_USERS.admin.id,
      decidedByName: DEMO_USERS.admin.name,
      createdAt: daysAgo(4),
      decidedAt: daysAgo(3),
    },
  })
  await prisma.featureFlagAudit.createMany({
    data: [
      {
        event: 'change_requested',
        flagId: approved.flagId,
        requestId: approved.id,
        actorId: DEMO_USERS.ops.id,
        actorName: DEMO_USERS.ops.name,
        actorRole: DEMO_USERS.ops.role,
        reason: approved.reason,
        createdAt: daysAgo(4),
      },
      {
        event: 'change_approved',
        flagId: approved.flagId,
        requestId: approved.id,
        actorId: DEMO_USERS.admin.id,
        actorName: DEMO_USERS.admin.name,
        actorRole: DEMO_USERS.admin.role,
        reason: 'Reviewed the staging screenshots; approved for staging only.',
        createdAt: daysAgo(3),
      },
    ],
  })

  const rejected = await prisma.featureFlagChangeRequest.create({
    data: {
      flagId: flags.kyc_auto_clear.id,
      requestedEnabled: true,
      reason: 'Auto-clear low-risk cases to cut the review backlog.',
      status: 'rejected',
      requestedById: DEMO_USERS.ops.id,
      requestedByName: DEMO_USERS.ops.name,
      requestedByRole: DEMO_USERS.ops.role,
      decidedById: DEMO_USERS.admin.id,
      decidedByName: DEMO_USERS.admin.name,
      createdAt: daysAgo(9),
      decidedAt: daysAgo(8),
    },
  })
  await prisma.featureFlagAudit.createMany({
    data: [
      {
        event: 'change_requested',
        flagId: rejected.flagId,
        requestId: rejected.id,
        actorId: DEMO_USERS.ops.id,
        actorName: DEMO_USERS.ops.name,
        actorRole: DEMO_USERS.ops.role,
        reason: rejected.reason,
        createdAt: daysAgo(9),
      },
      {
        event: 'change_rejected',
        flagId: rejected.flagId,
        requestId: rejected.id,
        actorId: DEMO_USERS.admin.id,
        actorName: DEMO_USERS.admin.name,
        actorRole: DEMO_USERS.admin.role,
        reason: 'Compliance wants a manual sample check before any auto-clearing.',
        createdAt: daysAgo(8),
      },
    ],
  })
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
