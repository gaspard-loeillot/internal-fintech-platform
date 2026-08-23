'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setRole } from './roleAction'
import type { Role } from './auth'

export default function RoleSwitcher({ role, name }: { role: Role; name: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <div className="text-right text-xs">
      <label className="flex items-center justify-end gap-2">
        <span className="font-medium">Acting as {name}</span>
        <select
          value={role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as Role
            startTransition(async () => {
              await setRole(next)
              router.refresh()
            })
          }}
          className="rounded border border-gray-300 bg-transparent px-2 py-1"
        >
          <option value="analyst">analyst</option>
          <option value="ops">ops</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <p className="mt-1 text-gray-500">Demo identity - not production authentication</p>
    </div>
  )
}
