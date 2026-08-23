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

  // ── tool:refunds ──

  // ── tool:feature-flags ──
]
