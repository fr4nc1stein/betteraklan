export type BudgetYearStatus = 'actual' | 'current' | 'proposed';

export interface BudgetYearIncome {
  totalTaxRevenue: number;
  totalNonTaxRevenue: number;
  totalLocalSources: number;
  nationalTaxAllotment: number;
  philhealthPayments?: number;
  totalExternalSources?: number;
  totalReceipts?: number;
}

export interface BudgetYearExpenditure {
  personalServices: number;
  maintenanceAndOperatingExpenses: number;
  financialExpenses: number;
  capitalOutlay: number;
  specialPurposeAppropriation: number;
  totalExpenditures: number;
}

export interface BudgetYear {
  year: number;
  status: BudgetYearStatus;
  label: string;
  income: BudgetYearIncome;
  expenditure?: BudgetYearExpenditure;
  sourceNote: string;
}
