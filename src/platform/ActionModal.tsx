'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export type ActionResult = { ok: true } | { ok: false; error: string }

export default function ActionModal({
  triggerLabel,
  title,
  context,
  confirmLabel,
  action,
}: {
  triggerLabel: string
  title: string
  context: string
  confirmLabel: string
  action: (reason: string) => Promise<ActionResult>
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

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
        className="rounded border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-100"
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 text-gray-900 shadow-lg">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{context}</p>

            <label className="mt-4 block text-sm font-medium" htmlFor="action-modal-reason">
              Reason (10-300 characters)
            </label>
            <textarea
              id="action-modal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              placeholder="Why is this change needed?"
            />

            {error && (
              <p role="alert" className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {pending ? 'Working...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
