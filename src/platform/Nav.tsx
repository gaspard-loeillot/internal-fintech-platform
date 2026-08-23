import Link from 'next/link'
import { TOOLS } from './registry'
import { getCurrentUser } from './auth'
import RoleSwitcher from './RoleSwitcher'

export default async function Nav() {
  const user = await getCurrentUser()

  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">
            Internal Platform
          </Link>
          {TOOLS.map((tool) => (
            <Link key={tool.slug} href={tool.href} className="hover:underline">
              {tool.name}
            </Link>
          ))}
          <Link href="/audit" className="hover:underline">
            Audit History
          </Link>
        </div>
        <RoleSwitcher role={user.role} name={user.name} />
      </nav>
    </header>
  )
}
