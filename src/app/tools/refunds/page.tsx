import StatusBadge, { type Tone } from '@/platform/StatusBadge'
import { REFUNDS, REFUND_STATUSES, type RefundStatus } from './data'

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
    <div>
      <h1 className="text-xl font-semibold">Refunds</h1>
      <p className="mt-1 text-sm text-gray-600">
        Read-only view of fake refund requests. This prototype cannot execute refunds.
      </p>

      <form method="get" className="mt-4 flex items-center gap-2 text-sm">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={active ?? ''}
          className="rounded border border-gray-300 bg-transparent px-2 py-1"
        >
          <option value="">All</option>
          {REFUND_STATUSES.map((option) => (
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
            <th className="py-2 pr-3">Order ID</th>
            <th className="py-2 pr-3">Customer</th>
            <th className="py-2 pr-3">Amount</th>
            <th className="py-2 pr-3">Reason</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.orderId} className="border-b border-gray-200">
              <td className="py-2 pr-3 font-mono text-xs">{row.orderId}</td>
              <td className="py-2 pr-3">{row.customer}</td>
              <td className="py-2 pr-3">${row.amount.toFixed(2)}</td>
              <td className="py-2 pr-3 text-xs text-gray-600">{row.reason}</td>
              <td className="py-2 pr-3">
                <StatusBadge tone={STATUS_TONE[row.status]} label={row.status} />
              </td>
              <td className="py-2 text-xs text-gray-500">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
