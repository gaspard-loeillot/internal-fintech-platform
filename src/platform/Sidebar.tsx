import { TOOLS } from './registry'
import { getCurrentUser } from './auth'
import NavLinks, { type NavItem } from './NavLinks'
import RoleSwitcher from './RoleSwitcher'

// Nav order is fixed here; the registry keeps tool entries inside their own
// marker blocks and therefore cannot express ordering.
const NAV_ORDER = ['feature-flags', 'refunds', 'kyc-review']

export default async function Sidebar() {
  const user = await getCurrentUser()

  const items: NavItem[] = NAV_ORDER.flatMap((slug) => {
    const tool = TOOLS.find((entry) => entry.slug === slug)
    if (!tool) return []
    return [
      {
        href: tool.href,
        label: tool.name,
        matchPrefix: slug === 'feature-flags' ? '/tools/feature-flags' : undefined,
      },
    ]
  })
  items.push({ href: '/audit', label: 'Audit History' })

  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col justify-between border-r border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="px-3 pb-6 pt-2 text-base font-bold text-gray-900">Internal Platform</p>
        <NavLinks items={items} />
      </div>
      <RoleSwitcher role={user.role} name={user.name} />
    </aside>
  )
}
