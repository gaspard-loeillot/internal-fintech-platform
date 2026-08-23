'use server'

import { cookies } from 'next/headers'
import { ROLE_COOKIE, type Role } from './auth'

export async function setRole(role: Role) {
  const store = await cookies()
  store.set(ROLE_COOKIE, role, { path: '/' })
}
