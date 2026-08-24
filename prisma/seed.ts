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
  // Every flag belongs to one of the internal tools (its feature).
  const flagSeeds = [
    {
      key: 'refund_ui_v2',
      name: 'Refund UI v2',
      feature: 'Refunds',
      description: 'Redesigned refund review screen for the ops team.',
      enabled: true,
      environment: 'staging',
      rollout: 50,
    },
    {
      key: 'refund_status_filter',
      name: 'Status filter',
      feature: 'Refunds',
      description: 'Filter the refunds table by status.',
      enabled: true,
      environment: 'dev',
      rollout: 100,
    },
    {
      key: 'refund_bulk_export',
      name: 'Bulk export',
      feature: 'Refunds',
      description: 'Export the filtered refunds table as a CSV file.',
      enabled: false,
      environment: 'prod',
      rollout: 0,
    },
    {
      key: 'kyc_auto_clear',
      name: 'KYC auto-clear',
      feature: 'KYC Review',
      description: 'Auto-clear low-risk KYC cases without manual review.',
      enabled: false,
      environment: 'staging',
      rollout: 0,
    },
    {
      key: 'kyc_risk_scoring_v2',
      name: 'Risk scoring v2',
      feature: 'KYC Review',
      description: 'Second-generation risk scoring model for KYC cases.',
      enabled: true,
      environment: 'prod',
      rollout: 25,
    },
    {
      key: 'kyc_doc_upload_v2',
      name: 'Document upload v2',
      feature: 'KYC Review',
      description: 'Rebuilt document upload flow for KYC onboarding.',
      enabled: true,
      environment: 'dev',
      rollout: 100,
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
      flagId: flags.refund_bulk_export.id,
      requestedEnabled: true,
      reason: 'Finance needs refund exports for the monthly reconciliation; enable in prod.',
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
      flagId: flags.kyc_doc_upload_v2.id,
      requestedEnabled: false,
      reason: 'Upload failures reported on large PDFs; turn the new flow off in dev.',
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

  // Camera-ready self-approval demo: authored by admin, so admin is blocked.
  const adminAuthored = await prisma.featureFlagChangeRequest.create({
    data: {
      flagId: flags.kyc_risk_scoring_v2.id,
      requestedEnabled: false,
      reason: 'Demo row: request authored by the admin identity to show the self-approval block.',
      status: 'pending',
      requestedById: DEMO_USERS.admin.id,
      requestedByName: DEMO_USERS.admin.name,
      requestedByRole: DEMO_USERS.admin.role,
      createdAt: hoursAgo(1),
    },
  })
  await prisma.featureFlagAudit.create({
    data: {
      event: 'change_requested',
      flagId: adminAuthored.flagId,
      requestId: adminAuthored.id,
      actorId: DEMO_USERS.admin.id,
      actorName: DEMO_USERS.admin.name,
      actorRole: DEMO_USERS.admin.role,
      reason: adminAuthored.reason,
      createdAt: hoursAgo(1),
    },
  })

  const approved = await prisma.featureFlagChangeRequest.create({
    data: {
      flagId: flags.refund_ui_v2.id,
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
