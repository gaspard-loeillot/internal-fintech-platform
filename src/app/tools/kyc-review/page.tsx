import StatusBadge, { type Tone } from '@/platform/StatusBadge'
import { KYC_CASES, KYC_RISK_LEVELS, type KycReviewStatus, type KycRiskLevel } from './data'

const RISK_TONE: Record<KycRiskLevel, Tone> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

const STATUS_TONE: Record<KycReviewStatus, Tone> = {
  pending: 'neutral',
  in_review: 'info',
  cleared: 'success',
  escalated: 'danger',
}

export default async function KycReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ risk?: string }>
}) {
  const { risk } = await searchParams
  const active = KYC_RISK_LEVELS.find((option) => option === risk)
  const rows = active ? KYC_CASES.filter((row) => row.riskLevel === active) : KYC_CASES

  return (
    <div>
      <h1 className="text-xl font-semibold">KYC Review</h1>
      <p className="mt-1 text-sm text-gray-600">
        Read-only view of fake KYC cases. This prototype has no documents and no case actions.
      </p>

      <form method="get" className="mt-4 flex items-center gap-2 text-sm">
        <label htmlFor="risk">Risk level</label>
        <select
          id="risk"
          name="risk"
          defaultValue={active ?? ''}
          className="rounded border border-gray-300 bg-transparent px-2 py-1"
        >
          <option value="">All</option>
          {KYC_RISK_LEVELS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100">
          Filter
        </button>
      </form>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th className="py-2 pr-3">Customer</th>
            <th className="py-2 pr-3">Risk level</th>
            <th className="py-2 pr-3">Review status</th>
            <th className="py-2 pr-3">Review reason</th>
            <th className="py-2">Case age</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.customer} className="border-b border-gray-200">
              <td className="py-2 pr-3">{row.customer}</td>
              <td className="py-2 pr-3">
                <StatusBadge tone={RISK_TONE[row.riskLevel]} label={row.riskLevel} />
              </td>
              <td className="py-2 pr-3">
                <StatusBadge tone={STATUS_TONE[row.reviewStatus]} label={row.reviewStatus} />
              </td>
              <td className="py-2 pr-3 text-xs text-gray-600">{row.reviewReason}</td>
              <td className="py-2 text-xs text-gray-500">{row.caseAgeDays} days</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
