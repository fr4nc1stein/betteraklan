import { BudgetYear } from '@/types/budgetSummary';

/**
 * Provincial annual budget, by object of expenditure (FDPP Form 1b).
 * Reconciled from two source documents whose year columns overlap:
 * - "Annual Budget Report CY 2025" (expenditure side: 2023 actual, 2024 actual, 2025 proposed)
 * - "Annual Budget Report FY 2026" (income side: 2024 actual, 2025 current, 2026 proposed)
 * 2025 totals cross-validate exactly between both documents (P2,989,341,075.00).
 */
const budgetSummary: BudgetYear[] = [
  {
    year: 2024,
    status: 'actual',
    label: 'FY 2024 (Actual)',
    income: {
      totalTaxRevenue: 103_821_707.1,
      totalNonTaxRevenue: 725_866_949.75,
      totalLocalSources: 829_688_656.85,
      nationalTaxAllotment: 1_611_388_920.0,
      philhealthPayments: 0,
      totalExternalSources: 1_611_388_920.0,
      totalReceipts: 2_441_077_576.85,
    },
    expenditure: {
      personalServices: 996_613_101.0,
      maintenanceAndOperatingExpenses: 1_148_924_801.48,
      financialExpenses: 9_562_539.36,
      capitalOutlay: 103_032_000.0,
      specialPurposeAppropriation: 456_356_478.16,
      totalExpenditures: 2_714_488_920.0,
    },
    sourceNote:
      'Income is the closed-year actual (FY2026 Budget Report). Expenditure combines first-semester actuals with second-semester estimates as reported in the CY2025 Budget Report, so it will not net exactly against income.',
  },
  {
    year: 2025,
    status: 'current',
    label: 'CY 2025 (Current Year)',
    income: {
      totalTaxRevenue: 145_100_000.0,
      totalNonTaxRevenue: 931_000_000.0,
      totalLocalSources: 1_076_100_000.0,
      nationalTaxAllotment: 1_913_241_075.0,
      philhealthPayments: 920_578_802.53,
      totalExternalSources: 2_833_819_877.53,
      totalReceipts: 2_989_341_075.0,
    },
    expenditure: {
      personalServices: 1_103_896_893.0,
      maintenanceAndOperatingExpenses: 1_211_900_917.13,
      financialExpenses: 8_163_198.76,
      capitalOutlay: 136_660_000.0,
      specialPurposeAppropriation: 528_720_066.11,
      totalExpenditures: 2_989_341_075.0,
    },
    sourceNote:
      'Income and expenditure totals are balanced and cross-validated between both source budget reports.',
  },
  {
    year: 2026,
    status: 'proposed',
    label: 'CY 2026 (Proposed)',
    income: {
      totalTaxRevenue: 145_100_000.0,
      totalNonTaxRevenue: 931_000_000.0,
      totalLocalSources: 1_076_100_000.0,
      nationalTaxAllotment: 2_199_430_144.0,
      // Philhealth allocation and totals were not yet resolved in the source
      // document (shown as broken formula references) at time of publication.
    },
    sourceNote:
      'Proposed budget. Local Sources figures were carried forward unchanged from CY2025 pending finalization. Philhealth allocation and full expenditure breakdown were not yet available in the source document.',
  },
];

export default budgetSummary;
