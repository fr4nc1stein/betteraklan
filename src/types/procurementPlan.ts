export interface ProcurementPlanDepartment {
  department: string;
  head?: string;
  totalCost: number;
}

export interface ProcurementPlanYear {
  year: number;
  grandTotal: number;
  departments: ProcurementPlanDepartment[];
  sourceNote: string;
}
