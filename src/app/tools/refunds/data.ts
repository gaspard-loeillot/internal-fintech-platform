export const REFUND_STATUSES = ['requested', 'approved', 'rejected', 'paid'] as const

export type RefundStatus = (typeof REFUND_STATUSES)[number]

export type RefundRow = {
  orderId: string
  customer: string
  amount: number
  reason: string
  status: RefundStatus
  date: string
}

// Fake, hard-coded demo data. No refunds are ever executed by this prototype.
export const REFUNDS: RefundRow[] = [
  {
    orderId: 'ORD-10241',
    customer: 'Stephen Curry',
    amount: 129.99,
    reason: 'Duplicate charge',
    status: 'requested',
    date: '2026-08-18',
  },
  {
    orderId: 'ORD-10238',
    customer: 'Austin Reaves',
    amount: 42.5,
    reason: 'Item never delivered',
    status: 'approved',
    date: '2026-08-17',
  },
  {
    orderId: 'ORD-10230',
    customer: 'Lebron James',
    amount: 899.0,
    reason: 'Fraudulent transaction reported by customer',
    status: 'paid',
    date: '2026-08-15',
  },
  {
    orderId: 'ORD-10225',
    customer: 'Nikola Jokic',
    amount: 15.75,
    reason: 'Subscription cancelled within trial',
    status: 'rejected',
    date: '2026-08-14',
  },
  {
    orderId: 'ORD-10219',
    customer: 'Jayson Tatum',
    amount: 310.2,
    reason: 'Wrong currency applied at checkout',
    status: 'approved',
    date: '2026-08-13',
  },
  {
    orderId: 'ORD-10212',
    customer: 'Anthony Edwards',
    amount: 67.0,
    reason: 'Damaged on arrival',
    status: 'paid',
    date: '2026-08-11',
  },
  {
    orderId: 'ORD-10204',
    customer: 'Victor Wembanyama',
    amount: 1249.99,
    reason: 'Merchant billing error',
    status: 'requested',
    date: '2026-08-09',
  },
  {
    orderId: 'ORD-10198',
    customer: 'Tyrese Haliburton',
    amount: 24.0,
    reason: 'Promo code not applied',
    status: 'rejected',
    date: '2026-08-07',
  },
]
