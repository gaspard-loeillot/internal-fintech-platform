import StatusBadge, { type Tone } from '@/platform/StatusBadge'
import PageHeader from '@/platform/PageHeader'
import Table from '@/platform/Table'
import { buttonSecondary, buttonSmall } from '@/platform/buttons'
import { FeatureFlagsSection } from '../feature-flags/ui'
import { REFUNDS, REFUND_STATUSES, type RefundStatus } from './data'

export const dynamic = 'force-dynamic'

const STATUS_TONE: Record<RefundStatus, Tone> = {
  requested: 'warning',
  approved: 'info',
  rejected: 'danger',
  paid: 'success',
}

export default async function RefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = REFUND_STATUSES.find((option) => option === status)
  const rows = active ? REFUNDS.filter((row) => row.status === active) : REFUNDS

  return (
    <div className="space-y-10">
      <PageHeader
        title="Refunds"
        description="Read-only view of fake refund requests. This prototype cannot execute refunds."
      />

      <form method="get" className="flex items-center gap-2 text-sm">
        <label htmlFor="status" className="text-gray-500">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={active ?? ''}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1.5 transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <option value="">All</option>
          {REFUND_STATUSES.map((option) => (
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
          { header: 'Order ID' },
          { header: 'Customer', sortable: true },
          { header: 'Amount', sortable: true, align: 'right' },
          { header: 'Reason' },
          { header: 'Status' },
          { header: 'Date', sortable: true },
        ]}
        empty="No refunds match this filter."
        emptyHint="Clear the status filter to see every fake refund."
        rows={rows.map((row) => ({
          key: row.orderId,
          sortValues: [null, row.customer, row.amount, null, null, new Date(row.date).getTime()],
          cells: [
            <span key="order" className="font-mono text-xs text-gray-900">
              {row.orderId}
            </span>,
            <span key="customer" className="text-gray-900">
              {row.customer}
            </span>,
            <span key="amount" className="text-gray-900">
              ${row.amount.toFixed(2)}
            </span>,
            <span key="reason" className="text-xs text-gray-500">
              {row.reason}
            </span>,
            <StatusBadge key="status" tone={STATUS_TONE[row.status]} label={row.status} />,
            <span key="date" className="text-xs text-gray-500">
              {row.date}
            </span>,
          ],
        }))}
      />

      <FeatureFlagsSection feature="Refunds" />
    </div>
  )
}
