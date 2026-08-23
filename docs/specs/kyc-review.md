# Tool Spec: KYC Review Queue

## Purpose
Compliance analysts work the manual-review queue of flagged customer identity
verifications and decide approve / reject / escalate, with a full audit trail.

## Roles & access
| Role    | Access |
|---------|--------|
| Analyst | Full: work the queue, verify/flag documents, dismiss hits, decide cases |
| Ops     | Read-only |
| Admin   | Full (same as Analyst) |

Registry entry (verbatim): `{ slug: "kyc-review", name: "KYC Review Queue",
description: "Manual review queue for flagged identity verifications",
href: "/tools/kyc-review", roles: ["analyst", "ops", "admin"] }`

## Data entities

### KycCase
| Field | Type | Notes |
|-------|------|-------|
| customerName | String | realistic fake names in seed |
| email | String | fake domains only |
| country | String | ISO-2 code |
| riskLevel | String (one of: LOW, MEDIUM, HIGH) | |
| status | String (one of: PENDING, APPROVED, REJECTED, ESCALATED) | |
| slaDueAt | DateTime | drives the SLA badge |
| createdAt | DateTime | |

### KycDocument
| Field | Type | Notes |
|-------|------|-------|
| caseId | String (id of a KycCase) | |
| type | String (one of: PASSPORT, DRIVERS_LICENSE, PROOF_OF_ADDRESS, SELFIE) | |
| status | String (one of: UPLOADED, VERIFIED, FLAGGED) | |

### ScreeningHit
| Field | Type | Notes |
|-------|------|-------|
| caseId | String (id of a KycCase) | |
| source | String (one of: SANCTIONS, PEP, ADVERSE_MEDIA) | |
| matchedName | String | the watchlist entry that matched |
| matchStrength | Int | 0-100 |
| dismissed | Boolean | default false |
| dismissReason | String? | set when dismissing |

## Seed data
~30 cases: mostly PENDING; ~6 decided (APPROVED / REJECTED / ESCALATED). At
least 5 PENDING overdue (slaDueAt in the past), ~8 due within 24h. Risk levels
and countries varied; 2-4 documents per case.

State/audit consistency rules (seeded data must be indistinguishable from data
produced by the tool itself):
- PENDING cases: all documents UPLOADED (the initial state, which needs no
  audit provenance); hits may be dismissed or not.
- Decided cases: every ScreeningHit has dismissed=true with a dismissReason;
  APPROVED cases have no FLAGGED documents; documents are VERIFIED.
- Every seeded row in a non-initial state seeds its matching audit events
  (the decision event plus the prerequisite kyc.hit.dismissed /
  kyc.document.verified events, actor = a persona, timestamps consistent) so
  no History section is ever empty and no row state contradicts its history.

**Camera-ready case, first in default sort (most overdue):** HIGH risk,
overdue SLA, exactly one undismissed SANCTIONS hit (matchStrength ~90), 2-3
documents all UPLOADED, none FLAGGED — unblocking approval takes exactly two
on-camera actions (dismiss the hit, approve), with an optional third beat of
verifying a document live for an extra audit row.

## List view
- Columns: Customer, Country, Risk (badge), SLA (badge), Age. No Status column
  (the default filter makes it redundant) and no document count.
- Tones: Risk HIGH=danger, MEDIUM=warning, LOW=neutral. SLA: "Overdue"=danger
  (slaDueAt past), "<24h"=warning, "On track"=success.
- Filters: status (default PENDING), riskLevel, country. Sort: slaDueAt
  ascending (in queries.ts).
- Stat cards: Pending count, Overdue count, High-risk pending count.

## Detail view
1. PageHeader: customer, email, country, risk badge, status, SLA due.
2. Documents section: each document with type + status; actions: verify, flag.
3. Screening hits section: source, matched name, strength; action: dismiss.
4. Decision panel: Approve / Reject / Escalate via ActionModal.
   Context line: "<customerName> — <riskLevel> risk".
5. History: this case's audit events, newest first (getEntityHistory).

## Actions
| Action | Allowed roles | Required inputs | Effect | Audit event name |
|--------|---------------|-----------------|--------|------------------|
| verify_document | Analyst, Admin | - | document -> VERIFIED | kyc.document.verified |
| flag_document | Analyst, Admin | reason | document -> FLAGGED | kyc.document.flagged |
| dismiss_hit | Analyst, Admin | reason | hit.dismissed = true | kyc.hit.dismissed |
| approve_case | Analyst, Admin | reason | status -> APPROVED | kyc.case.approved |
| reject_case | Analyst, Admin | reason | status -> REJECTED | kyc.case.rejected |
| escalate_case | Analyst, Admin | reason | status -> ESCALATED | kyc.case.escalated |

## Audit identity
ALL six events use tool "kyc-review" (the registry slug), entityType
"KycCase", and entityId = the case id. The specific document/hit id, and for
dismissals the source, matchedName, and matchStrength, go in metadata.

## Guardrails
- approve_case is blocked while any ScreeningHit has dismissed=false or any
  KycDocument is FLAGGED. Message: "Cannot approve: unresolved screening hits
  or flagged documents."
- Every action (documents, hits, decisions) is blocked unless the case status
  is PENDING. Message: "Case is already decided."
- Both checked inside the transaction against database state; decisions use
  updateMany with the status precondition in the where clause.

## Audit events
kyc.document.verified, kyc.document.flagged, kyc.hit.dismissed,
kyc.case.approved, kyc.case.rejected, kyc.case.escalated.

## Out of scope
- Four-eyes second approval. Note: in production, dismissing a SANCTIONS hit
  would require second-reviewer signoff (strict-liability area); single-analyst
  dismissal is a deliberate demo simplification, and the maker-checker queue is
  the natural tool #4.
- Case assignment/claiming (cases arrive PENDING from the upstream pipeline).
- Structured reason-code taxonomies (production constrains reasons to coded
  values + narrative; free text is the demo simplification).
- Real identity-verification vendor integration; document image storage or
  display; SLA notifications.
