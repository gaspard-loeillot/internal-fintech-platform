import 'server-only'
import { cookies } from 'next/headers'

export type Role = 'analyst' | 'ops' | 'admin'

export type DemoUser = {
  id: string
  name: string
  role: Role
}

export const ROLES = ['analyst', 'ops', 'admin'] as const

export const ROLE_COOKIE = 'demo_role'

// Fake identities: one fixed user per role so self-approval checks are stable.
export const USERS_BY_ROLE: Record<Role, DemoUser> = {
  analyst: { id: 'user-analyst', name: 'Stephen Curry', role: 'analyst' },
  ops: { id: 'user-ops', name: 'Austin Reaves', role: 'ops' },
  admin: { id: 'user-admin', name: 'Lebron James', role: 'admin' },
}

function isRole(value: string | undefined): value is Role {
  return value === 'analyst' || value === 'ops' || value === 'admin'
}

export async function getCurrentUser(): Promise<DemoUser> {
  const store = await cookies()
  const raw = store.get(ROLE_COOKIE)?.value
  const role: Role = isRole(raw) ? raw : 'analyst'
  return USERS_BY_ROLE[role]
}
