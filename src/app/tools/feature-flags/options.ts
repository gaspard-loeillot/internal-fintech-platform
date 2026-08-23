export const FLAG_ENVIRONMENTS = ['dev', 'staging', 'prod'] as const
export const CHANGE_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const
export const AUDIT_EVENTS = [
  'change_requested',
  'change_approved',
  'change_rejected',
  'flag.emergency_off',
] as const

export type FlagEnvironment = (typeof FLAG_ENVIRONMENTS)[number]
export type ChangeRequestStatus = (typeof CHANGE_REQUEST_STATUSES)[number]
export type AuditEvent = (typeof AUDIT_EVENTS)[number]
