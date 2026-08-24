'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { buttonDanger, buttonPrimary, buttonSecondary, buttonSmall } from './buttons'

export type ActionResult = { ok: true } | { ok: false; error: string }

export default function ActionModal({
  triggerLabel,
  title,
  context,
  confirmLabel,
  action,
  variant = 'secondary',
}: {
  triggerLabel: string
  title: string
  context: string
  confirmLabel: string
  action: (reason: string) => Promise<ActionResult>
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const triggerClass =
    variant === 'danger' ? buttonDanger : variant === 'primary' ? buttonPrimary : buttonSecondary
  const confirmClass = variant === 'danger' ? buttonDanger : buttonPrimary

  function close() {
    setOpen(false)
    setReason('')
    setError(null)
  }

  function confirm() {
    setError(null)
    startTransition(async () => {
      const result = await action(reason)
      if (result.ok) {
        close()
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${triggerClass} ${buttonSmall}`}
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-150 motion-safe:animate-[fadeIn_150ms_ease-out]">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{context}</p>

            <label className="mt-5 block text-sm font-medium" htmlFor="action-modal-reason">
              Reason (10-300 characters)
            </label>
            <textarea
              id="action-modal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm transition-all duration-150 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              placeholder="Why is this change needed?"
            />

            {error && (
              <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={close} disabled={pending} className={buttonSecondary}>
                Cancel
              </button>
              <button type="button" onClick={confirm} disabled={pending} className={confirmClass}>
                {pending ? 'Working...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
