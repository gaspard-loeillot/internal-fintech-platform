# Tool Spec: Refunds Dashboard

## Purpose
Ops agents review pending refund requests and approve or deny them within
their authority limit, with amount-tiered approval, segregation of duties, and
a full audit trail.

## Roles & access
| Role    | Access |
|---------|--------|
| Analyst | Read-only |
| Ops     | Decide refunds up to $1,000 |
| Admin   | Decide any amount |

Registry entry (verbatim): `{ slug: "refunds", name: "Refunds Dashboard",
description: "Review and decide customer refund requests",
href: "/tools/refunds", roles: ["analyst", "ops", "admin"] }`

## Data entities

### RefundRequest
| Field | Type | Notes |
|-------|------|-------|
| orderId | String | e.g. ORD-48213 |
| customerName | String | fake names |
| amountCents | Int | money is integer cents |
| currency | String | "USD" |
| reasonCode | String (one of: DUPLICATE, FRAUD, CUSTOMER_REQUEST, CHARGEBACK_PREVENTION) | |
| status | String (one of: PENDING, APPROVED, DENIED) | |
| requestedBy | String | requesting agent (a persona name) |
| requestedAt | DateTime | |
| decidedBy | String? | |
| decidedAt | DateTime? | |

## Seed data
~40 rows. ~15 PENDING, including 3-4 over $1,000 and **1-2 requested by
"devon.ross", both UNDER $1,000 and disjoint from the over-limit set** (the
ops persona — so the segregation-of-duties block is demoable as ops without
colliding with the amount tier). The rest APPROVED/DENIED across the past 3
weeks, each with
its matching refund.approved / refund.denied audit event seeded (actor =
decidedBy, at = decidedAt), **including at least 5 APPROVED with decidedAt in
the last 7 days** so the Approved-this-week card is non-zero. Amounts $8 to
$4,200; reason codes distributed.

## List view
- Stat cards (computed from the DB): Pending count, Pending $ total,
  Approved-this-week $ (decidedAt within the last 7 rolling days).
- Columns: Order, Customer, Amount (right-aligned, formatMoney; when PENDING
  and amount > $1,000, a warning-tone "Needs admin" badge inside the Amount cell),
  Reason (plain text, not a badge), Status (badge: PENDING=info,
  APPROVED=success, DENIED=danger), Requested (age).
- Filters: status (default PENDING), reasonCode. Sort: requestedAt ascending
  (in queries.ts).

## Detail view
None (deliberately modest). Decisions happen from the row via ActionModal.
Context line: "<orderId> — <formatMoney(amountCents)> — <customerName>".

## Actions
| Action | Allowed roles | Required inputs | Effect | Audit event name |
|--------|---------------|-----------------|--------|------------------|
| approve_refund | Ops (<= $1,000), Admin (any) | reason | PENDING -> APPROVED, set decidedBy/decidedAt | refund.approved (metadata: amountCents) |
| deny_refund | Ops, Admin | reason | PENDING -> DENIED, set decidedBy/decidedAt | refund.denied (metadata: amountCents) |

## Audit identity
All events use tool "refunds" (the registry slug), entityType "RefundRequest",
and entityId = the refund id.

## Guardrails (checked in this exact order; amount and requestedBy are
immutable fields, so they are read once before the transaction; status is
enforced race-proof inside it)
1. Already decided: if the row is missing or not PENDING, reject. Message:
   "Not found or already decided."
2. Segregation of duties: approve_refund and deny_refund are blocked when
   requestedBy equals the current actor. Message: "Requesters cannot decide
   their own refunds." (No blocked-attempt event.)
3. Amount tier: approve_refund with amountCents > 100000 requires Admin; an
   Ops attempt is rejected server-side. Message: "Refunds over $1,000 require
   Admin approval." **This block, and only this block, writes audit event
   refund.approve.blocked (metadata: amountCents, limitCents)** — attempts are
   auditable even when nothing changes. The amount is read from the database
   inside the action; it is never accepted from the client.
4. The decision itself runs as updateMany with the PENDING precondition in the
   where clause, atomic with its audit event.
- UI rule, deliberate: Ops SEES the Approve button on all pending rows
  including >$1,000 (the badge signals the tier); the block comes only from
  the server. This is how server-side enforcement is demonstrated.

## Audit events
refund.approved, refund.denied, refund.approve.blocked.

## Out of scope
Payment-rail execution ("mark paid"), partial refunds, reconciliation view,
per-agent velocity flags, approval queues/second sign-off beyond the amount
tier.
