// ============================================
// Transaction & Financial Types
// ============================================

export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected';
export type PaymentMethod = 'Cash' | 'Bank_Transfer' | 'UPI' | 'Cheque';
export type PaymentStatus = 'Paid' | 'Not_Paid' | 'Pending' | 'Waived';
export type FundCategoryType = 'ZAKAT' | 'SADAQAH' | 'WAQF' | 'GENERAL' | 'FITRAH' | 'LILLAH';

export interface FundCategory {
  id: string;
  tenant_id: string;
  fund_name: string;
  compliance_type: FundCategoryType;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  donor_id: string | null;
  admin_id: string | null;
  fund_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  description: string | null;
  reference_number: string | null;
  transaction_date: string;
  notes: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PeriodicSubscription {
  id: string;
  tenant_id: string;
  person_id: string;
  subscription_type: string;
  month: number;
  year: number;
  payment_status: PaymentStatus;
  amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateFundCategoryInput = Omit<FundCategory, 'id' | 'created_at' | 'updated_at'>;
export type CreateTransactionInput = Omit<
  Transaction,
  'id' | 'status' | 'created_at' | 'updated_at'
>;
export type CreateSubscriptionInput = Omit<
  PeriodicSubscription,
  'id' | 'created_at' | 'updated_at'
>;
