export const KYC_RISK_LEVELS = ['low', 'medium', 'high'] as const
export const KYC_REVIEW_STATUSES = ['pending', 'in_review', 'cleared', 'escalated'] as const

export type KycRiskLevel = (typeof KYC_RISK_LEVELS)[number]
export type KycReviewStatus = (typeof KYC_REVIEW_STATUSES)[number]

export type KycRow = {
  customer: string
  riskLevel: KycRiskLevel
  reviewStatus: KycReviewStatus
  reviewReason: string
  caseAgeDays: number
}

// Fake, hard-coded demo data. No documents, no case actions in this prototype.
export const KYC_CASES: KycRow[] = [
  {
    customer: 'Stephen Curry',
    riskLevel: 'low',
    reviewStatus: 'cleared',
    reviewReason: 'Routine periodic refresh',
    caseAgeDays: 2,
  },
  {
    customer: 'Austin Reaves',
    riskLevel: 'medium',
    reviewStatus: 'in_review',
    reviewReason: 'Address mismatch with document',
    caseAgeDays: 5,
  },
  {
    customer: 'Lebron James',
    riskLevel: 'high',
    reviewStatus: 'escalated',
    reviewReason: 'PEP screening hit requires manual review',
    caseAgeDays: 12,
  },
  {
    customer: 'Nikola Jokic',
    riskLevel: 'low',
    reviewStatus: 'pending',
    reviewReason: 'New account onboarding',
    caseAgeDays: 1,
  },
  {
    customer: 'Jayson Tatum',
    riskLevel: 'medium',
    reviewStatus: 'pending',
    reviewReason: 'Unusual first-month transaction volume',
    caseAgeDays: 4,
  },
  {
    customer: 'Anthony Edwards',
    riskLevel: 'high',
    reviewStatus: 'in_review',
    reviewReason: 'Sanctions list name similarity',
    caseAgeDays: 9,
  },
  {
    customer: 'Victor Wembanyama',
    riskLevel: 'low',
    reviewStatus: 'cleared',
    reviewReason: 'Document verification passed',
    caseAgeDays: 21,
  },
  {
    customer: 'Tyrese Haliburton',
    riskLevel: 'medium',
    reviewStatus: 'escalated',
    reviewReason: 'Source-of-funds evidence incomplete',
    caseAgeDays: 15,
  },
]
