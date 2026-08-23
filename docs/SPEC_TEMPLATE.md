# Tool Spec: <Tool Name>

> Fill every section. A Devin session turns this file into a working tool
> module on the platform chassis. Keep it under ~120 lines; if you need more,
> split the tool.

## Purpose
One sentence: who uses this and what decision/action it enables.

## Roles & access
| Role    | Access |
|---------|--------|
| Analyst | e.g. full / read-only / none |
| Ops     | |
| Admin   | |

Roles are lowercase literals in code (`analyst`, `ops`, `admin`); capitalize
for display only.

## Data entities
One table per entity. These become Prisma models inside this tool's marked
region of schema.prisma. Conventions: every model id is
`String @id @default(cuid())`; prefix model names with the tool
(KycCase, RefundRequest — never Status or Case); enum-like fields are
**String (one of: A, B, C)** — never a Prisma enum (portability across Prisma
versions; export an `as const` array where the UI needs the option list);
relations only between this tool's own models — reference anything else by
string id.

### <EntityName>
| Field | Type | Notes |
|-------|------|-------|

## Seed data
How many rows, what distribution across statuses, what makes it look real.
Seeds must exercise every badge/filter/stat state, and every seeded row in a
non-initial state must also seed its matching audit events (same event names
as the Actions table, actor/timestamps consistent) so History sections and
/audit reconcile with visible state. Include one camera-ready row designed
for the demo walkthrough.

## List view
- Columns in order, including badge tone mappings
  (StatusBadge tones are exactly: neutral, info, success, warning, danger)
- Filters (field + options) and the default filter/sort
  (sorting is queries.ts ORDER BY; the table has no click-sort)
- Stat cards above the table (metric + how computed)

## Detail view (omit if the tool decides from the list)
Ordered sections. Every detail view ends with a History section rendered via
getEntityHistory(entityType, entityId).

## Actions
| Action | Allowed roles | Required inputs | Effect (state transition) | Audit event name |
|--------|---------------|-----------------|---------------------------|------------------|
Every decision-grade action (anything in Guardrails or that changes a status)
requires a reason (min 10 chars, server-validated) via ActionModal; lightweight
actions may be plain buttons that still write audit events (reason null).
Give ActionModal a context line (what entity, which amount/name) so the
confirmation frame self-describes.

## Audit identity
One line: the tool field (always this tool's registry slug; the chassis is
the one exception, it writes tool "platform"), plus the entityType and
entityId ALL this tool's events use (attach events to the top-level entity;
sub-entity ids go in metadata).

## Guardrails
Conditions under which an action must be blocked server-side, with the exact
message shown. Guardrails are checked inside the transaction against database
state only — never against client-supplied values.

## Audit events
Complete list of event names this tool writes (must match the Actions table),
plus what goes in metadata.

## Out of scope
What this tool deliberately does NOT do. Descope knowingly: name the
production control you are skipping and where it would live.
