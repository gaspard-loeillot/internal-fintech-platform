'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/platform/db'
import { getCurrentUser } from '@/platform/auth'

export type ActionResult = { ok: true } | { ok: false; error: string }

const PATH = '/tools/feature-flags'

function validateReason(reason: string): string | null {
  const trimmed = reason.trim()
  if (trimmed.length < 10 || trimmed.length > 300) {
    return 'Reason must be between 10 and 300 characters.'
  }
  return null
}

export async function requestFlagChange(
  flagId: string,
  requestedEnabled: boolean,
  reason: string,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (user.role !== 'ops') {
    return { ok: false, error: 'Only ops may request a flag change.' }
  }

  const reasonError = validateReason(reason)
  if (reasonError) return { ok: false, error: reasonError }

  const flag = await prisma.featureFlag.findUnique({ where: { id: flagId } })
  if (!flag) return { ok: false, error: 'Flag not found.' }

  const trimmed = reason.trim()
  await prisma.$transaction(async (tx) => {
    const request = await tx.featureFlagChangeRequest.create({
      data: {
        flagId,
        requestedEnabled,
        reason: trimmed,
        status: 'pending',
        requestedById: user.id,
        requestedByName: user.name,
        requestedByRole: user.role,
      },
    })
    await tx.featureFlagAudit.create({
      data: {
        event: 'change_requested',
        flagId,
        requestId: request.id,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        reason: trimmed,
      },
    })
  })

  revalidatePath(PATH)
  return { ok: true }
}

async function decide(
  requestId: string,
  reason: string,
  approve: boolean,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (user.role !== 'admin') {
    return { ok: false, error: 'Only admin may decide a change request.' }
  }

  const reasonError = validateReason(reason)
  if (reasonError) return { ok: false, error: reasonError }

  const request = await prisma.featureFlagChangeRequest.findUnique({ where: { id: requestId } })
  if (!request) return { ok: false, error: 'Request not found.' }
  if (request.requestedById === user.id) {
    return { ok: false, error: 'You cannot approve your own request.' }
  }
  if (request.status !== 'pending') return { ok: false, error: 'Already decided.' }

  const trimmed = reason.trim()
  const decided = await prisma.$transaction(async (tx) => {
    const updated = await tx.featureFlagChangeRequest.updateMany({
      where: { id: requestId, status: 'pending' },
      data: {
        status: approve ? 'approved' : 'rejected',
        decidedById: user.id,
        decidedByName: user.name,
        decidedAt: new Date(),
      },
    })
    if (updated.count === 0) return false

    if (approve) {
      await tx.featureFlag.update({
        where: { id: request.flagId },
        data: { enabled: request.requestedEnabled },
      })
    }

    await tx.featureFlagAudit.create({
      data: {
        event: approve ? 'change_approved' : 'change_rejected',
        flagId: request.flagId,
        requestId: request.id,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        reason: trimmed,
      },
    })
    return true
  })

  if (!decided) return { ok: false, error: 'Already decided.' }

  revalidatePath(PATH)
  return { ok: true }
}

export async function approveChangeRequest(
  requestId: string,
  reason: string,
): Promise<ActionResult> {
  return decide(requestId, reason, true)
}

export async function rejectChangeRequest(
  requestId: string,
  reason: string,
): Promise<ActionResult> {
  return decide(requestId, reason, false)
}
