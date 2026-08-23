// Tool registry — the app shell renders nav and home cards from TOOLS.
// S1 adds chassis entries above the markers. Tool sessions add their entry
// ONLY inside their own marker block.
export type ToolEntry = {
  slug: string
  name: string
  description: string
  href: string
  roles: ('analyst' | 'ops' | 'admin')[]
}

export const TOOLS: ToolEntry[] = [
  // chassis entries (S1) go here, above the tool markers

  // ── tool:kyc-review ──
  {
    slug: 'kyc-review',
    name: 'KYC Review',
    description: 'Read-only view of fake KYC cases with risk and review status.',
    href: '/tools/kyc-review',
    roles: ['analyst', 'ops', 'admin'],
  },

  // ── tool:refunds ──
  {
    slug: 'refunds',
    name: 'Refunds',
    description: 'Read-only view of fake refund requests.',
    href: '/tools/refunds',
    roles: ['analyst', 'ops', 'admin'],
  },

  // ── tool:feature-flags ──
  {
    slug: 'feature-flags',
    name: 'Feature Flags',
    description: 'Request and approve feature-flag changes with an audit trail.',
    href: '/tools/feature-flags',
    roles: ['analyst', 'ops', 'admin'],
  },
]
