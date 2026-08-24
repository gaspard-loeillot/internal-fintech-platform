# Internal Fintech Platform (prototype)

A demo internal platform: one complete feature-flag change workflow plus two read-only tools
(Refunds, KYC Review) on a shared shell (sidebar nav, demo role switcher, status badges, action
modal, sortable table, audit history). Feature flags are the home page (`/`); each flag belongs to
a feature (Refunds or KYC Review), is listed again on that feature's page, and has its own page at
`/tools/feature-flags/<key>`. All data is fake.

## Install & run

```bash
npm install
npm run db:reset   # prisma db push --force-reset && prisma db seed
npm run dev        # http://localhost:3000
```

`npm run build` produces a production build. Never use `prisma migrate` in this repo; schema
changes go through `npm run db:reset`.

## Demo path

1. Open http://localhost:3000. The role switcher in the sidebar starts as
   **analyst** (Stephen Curry) — no request or decision buttons are offered.
2. Switch to **ops** (Austin Reaves) and click "Request enable"/"Request disable" on a flag.
   Enter a reason of at least 10 characters and submit. A reason shorter than 10 characters is
   rejected by the server and the error stays inline in the open modal. The new request shows up
   under "Pending change requests" and a `change_requested` entry appears in the audit history.
3. Still as **ops**, try to approve — the decision buttons are admin-only.
4. Switch to **admin** (Lebron James) and approve the seeded pending request from Austin Reaves
   ("Bulk export"). The flag flips to enabled and both audit entries (requested +
   approved) are visible on the page and on /audit.
5. Self-approval check: as **ops**, create a request; switch to **admin** only to see it, then
   switch the request's own author into the deciding role — the server returns exactly
   `You cannot approve your own request.` inline in the modal, which stays open. (The same check
   fires if an admin tries to decide a request they created themselves.)
6. Decide-once: approving/rejecting an already-decided request returns `Already decided.`
7. Emergency off: as **admin**, open an enabled production flag (e.g. `kyc_risk_scoring_v2`) and
   click "Emergency off". With a valid reason the flag is disabled immediately with no approval
   step and a `flag.emergency_off` audit entry (no request id) appears.

## What this prototype demonstrates

- A decision-grade workflow with segregation of duties: ops requests, admin decides.
- Server-side enforcement of everything that matters: role permissions, reason length (10-300),
  self-approval prevention, and decide-once via a conditional `updateMany`.
- Flag update and audit write happen inside one `prisma.$transaction` — both or neither.
- An audit trail in the local database, rendered on the home page, each flag page, and `/audit`,
  with event and request ids as the first columns so a decision traces back to its request.
- An admin-only emergency off for enabled production flags: same reason rules, no approval step.
- Feature-centric navigation: the flags table leads with the owning feature, and each feature page
  carries its own flags section with the same server rules.
- A flag filter on `/audit`.
- A shared shell (registry-driven nav, role switcher, `StatusBadge`, `ActionModal`) that new
  tools plug into.

## What it deliberately does NOT demonstrate

- Real authentication or authorization — the role switcher is a cookie holding a fake identity.
- Any integration with a real flag service, payment processor, or KYC vendor.
- Refund execution: the Refunds tool is a read-only table of hard-coded rows.
- KYC actions or documents: the KYC tool is a read-only table of hard-coded rows.
- Deployment, observability, multi-tenancy, or data retention.

## Build record

- Time spent: [TIME SPENT]
- Corrections made: [CORRECTIONS MADE]
