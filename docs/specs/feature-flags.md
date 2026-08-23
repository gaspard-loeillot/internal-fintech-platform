# Tool Spec: Feature-Flag Admin Panel

> DELIBERATELY LEFT UNFILLED.
> This stub is the point: adding tool #3 to the platform means filling the
> template (~30 min of PM time) and pasting the standard build prompt into a
> Devin session. See docs/SPEC_TEMPLATE.md for the format and
> docs/specs/refunds.md for a filled example. Its reserved marker regions
> already exist in schema.prisma, seed.ts, and registry.ts.

## Purpose
(unfilled)

## Roles & access
(unfilled)

## Data entities
(unfilled - would be: FeatureFlag, FlagRule, with String one-of fields for
environment and rule type; every model id String @id @default(cuid()))

## List view
(unfilled - would be: flag list with per-environment state badges)

## Detail view
(unfilled)

## Actions
(unfilled - would include: toggle per environment with required reason via
ActionModal; prod toggles gated to Admin)

## Audit identity
(unfilled - would be: entityType "FeatureFlag", entityId = flag id)

## Guardrails
(unfilled - would be: prod changes require Admin + reason; protected flags
blocked server-side)

## Audit events
(unfilled - would be: flag.created, flag.toggled, flag.rule_changed)

## Out of scope
(unfilled - would be: SDK read path, percentage rollouts, experiment stats)
