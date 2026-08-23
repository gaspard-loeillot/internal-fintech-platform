import Link from 'next/link'
import { TOOLS } from '@/platform/registry'

export default function Home() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Internal Fintech Platform</h1>
      <p className="mt-1 text-sm text-gray-600">
        Prototype with fake data. Feature flags is the only complete workflow; refunds and KYC
        review are read-only.
      </p>

      <ul className="mt-6 space-y-3">
        {TOOLS.map((tool) => (
          <li key={tool.slug}>
            <Link href={tool.href} className="font-medium hover:underline">
              {tool.name}
            </Link>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
