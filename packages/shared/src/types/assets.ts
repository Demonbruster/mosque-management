// ============================================
// Asset & Rental Types
// ============================================

export type AgreementStatus = "Active" | "Expired" | "Terminated" | "Pending";

export interface FixedAsset {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  fund_source: string | null;
  purchase_price: number | null;
  current_value: number | null;
  acquisition_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenancyAgreement {
  id: string;
  tenant_id: string;
  person_id: string;
  asset_id: string;
  rent_amount: number;
  security_deposit: number | null;
  start_date: string;
  end_date: string | null;
  status: AgreementStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UtensilInventory {
  id: string;
  tenant_id: string;
  item_name: string;
  description: string | null;
  stock_quantity: number;
  rental_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface UtensilRental {
  id: string;
  tenant_id: string;
  customer_id: string;
  utensil_id: string;
  quantity: number;
  issue_date: string;
  return_date: string | null;
  penalty_fee: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
