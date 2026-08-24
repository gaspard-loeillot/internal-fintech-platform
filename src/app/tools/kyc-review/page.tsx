import StatusBadge, { type Tone } from '@/platform/StatusBadge'
import PageHeader from '@/platform/PageHeader'
import Table from '@/platform/Table'
import { buttonSecondary, buttonSmall } from '@/platform/buttons'
import { FeatureFlagsSection } from '../feature-flags/ui'
import { KYC_CASES, KYC_RISK_LEVELS, type KycReviewStatus, type KycRiskLevel } from './data'

export const dynamic = 'force-dynamic'

const RISK_TONE: Record<KycRiskLevel, Tone> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

const RISK_ORDER: Record<KycRiskLevel, number> = { low: 0, medium: 1, high: 2 }

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
    <div className="space-y-10">
      <PageHeader
        title="KYC Review"
        description="Read-only view of fake KYC cases. This prototype has no documents and no case actions."
      />

      <form method="get" className="flex items-center gap-2 text-sm">
        <label htmlFor="risk" className="text-gray-500">
          Risk level
        </label>
        <select
          id="risk"
          name="risk"
          defaultValue={active ?? ''}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <option value="">All</option>
          {KYC_RISK_LEVELS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit" className={`${buttonSecondary} ${buttonSmall}`}>
          Filter
        </button>
      </form>

      <Table
        columns={[
          { header: 'Customer', sortable: true },
          { header: 'Risk', sortable: true },
          { header: 'Review status' },
          { header: 'Review reason' },
          { header: 'Date opened', sortable: true },
          { header: 'Case age', align: 'right' },
        ]}
        empty="No KYC cases match this filter."
        emptyHint="Clear the risk filter to see every fake case."
        rows={rows.map((row) => ({
          key: row.customer,
          sortValues: [
            row.customer,
            RISK_ORDER[row.riskLevel],
            null,
            null,
            new Date(row.openedDate).getTime(),
            null,
          ],
          cells: [
            <span key="customer" className="text-gray-900">
              {row.customer}
            </span>,
            <StatusBadge key="risk" tone={RISK_TONE[row.riskLevel]} label={row.riskLevel} />,
            <StatusBadge key="status" tone={STATUS_TONE[row.reviewStatus]} label={row.reviewStatus} />,
            <span key="reason" className="text-xs text-gray-500">
              {row.reviewReason}
            </span>,
            <span key="opened" className="text-xs text-gray-500">
              {row.openedDate}
            </span>,
            <span key="age" className="text-xs text-gray-500">
              {row.caseAgeDays} days
            </span>,
          ],
        }))}
      />

      <FeatureFlagsSection feature="KYC Review" />
    </div>
  )
}
