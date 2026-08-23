'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setRole } from './roleAction'
import type { Role } from './auth'

export default function RoleSwitcher({ role, name }: { role: Role; name: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <div className="border-t border-gray-200 px-3 pt-4">
      <label className="block text-xs font-medium text-gray-900" htmlFor="role-switcher">
        Acting as {name}
      </label>
      <select
        id="role-switcher"
        value={role}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Role
          startTransition(async () => {
            await setRole(next)
            router.refresh()
          })
        }}
        className="mt-1 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
      >
        <option value="analyst">analyst</option>
        <option value="ops">ops</option>
        <option value="admin">admin</option>
      </select>
      <p className="mt-2 text-xs text-gray-500">Demo identity - not production authentication</p>
    </div>
  )
}
