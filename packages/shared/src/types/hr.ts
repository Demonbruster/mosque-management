// ============================================
// HR & Payroll Types
// ============================================

export interface EmployeePayroll {
  id: string;
  tenant_id: string;
  employee_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number | null;
  payment_date: string;
  month: number;
  year: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLoan {
  id: string;
  tenant_id: string;
  employee_id: string;
  total_amount: number;
  pending_balance: number;
  monthly_deduction: number;
  start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
