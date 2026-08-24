# Tool Spec: Feature Flags

> This spec matches the tool as built (PRs 1-3). It is the prototype's one
> complete workflow and the platform's home page. It started smaller and grew
> through review feedback; the git history shows the iterations.

## Purpose
Request-and-approve workflow for toggling feature flags, with segregation of
duties and a full audit trail. Flags are organized by the feature they control
(Refunds, KYC Review) and link into those features' pages.

## Roles & access
| Role    | Access |
|---------|--------|
| analyst | Read-only everywhere |
| ops     | Request flag changes |
| admin   | Approve/reject requests; Emergency off |

Each role maps to a fixed demo identity so self-approval checks work. The
switcher is labeled "Demo identity - not production authentication".

## Data entities
- FeatureFlag: key (unique), name, description, feature ("Refunds" | "KYC Review"),
  environment (dev | staging | prod), enabled, rolloutPercentage, updatedAt.
- FeatureFlagChangeRequest: flagId, requestedEnabled, reason, status
  (pending | approved | rejected), requestedBy (id/name/role), decidedBy?,
  createdAt, decidedAt?.
- FeatureFlagAudit: event (change_requested | change_approved | change_rejected |
  flag.emergency_off), flagId, requestId?, actor (id/name/role), reason, createdAt.

## Screens
- Home (/): flags table with Feature as the first column (hyperlinked to the
  feature's page), then key, name, environment, state, rollout, last updated
  (always one line), actions. Below it: pending change requests, then audit
  history. Event ID and Request ID are the first audit columns.
- Per-flag page at /tools/feature-flags/<key>: flag info, request/decide
  actions, that flag's audit history.
- Each feature page (Refunds, KYC Review) carries a section with its own flags
  and the same actions.
- /audit: global history with a flag filter.

## Rules (all enforced on the server, against database state)
- Only ops and admin may request; only admin may decide.
- Reason required, 10-300 characters, validated server-side.
- Self-approval blocked: "You cannot approve your own request."
- Decide-once via conditional update: "Already decided."
- Approving applies the flag change and writes its audit entry in ONE database
  transaction; decision entries carry the id of the request they decided.
- Emergency off: admin-only, immediate (no approval step), reason required,
  audited as flag.emergency_off with no request id.
- Every action returns { ok: true } | { ok: false, error }; failures render
  inside the open modal, which closes only on success.

## Out of scope
Real flag SDK / product read path, percentage rollout evaluation, archived
flags, notifications, real authentication.
