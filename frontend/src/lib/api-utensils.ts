// ============================================
// Utensil Rentals API Wrappers — TASK-014
// ============================================

import { api } from './api';

// ---- Types ----

export type PersonCategory = 'Member' | 'Non-Member' | 'Dependent' | 'Staff' | 'Hifl';

export interface UtensilItem {
  id: string;
  item_name: string;
  description: string | null;
  stock_quantity: number;
  rental_price: string | null;
  quantity_out?: number;
  available_quantity?: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface UtensilRental {
  id: string;
  quantity: number;
  issue_date: string;
  return_date: string | null;
  is_returned: boolean;
  quantity_returned: number | null;
  damage_description: string | null;
  penalty_fee: string;
  notes: string | null;
  item_name: string;
  rental_price: string | null;
  borrower_name: string;
  borrower_phone: string | null;
  borrower_category: PersonCategory;
  created_at: string;
}

export interface OutstandingRental extends UtensilRental {
  borrower_id: string;
  overdue_days: number;
  guarantor: {
    guarantor_id: string;
    guarantor_name: string;
    guarantor_phone: string | null;
  } | null;
}

export interface RentalDetail extends UtensilRental {
  customer_id: string;
  utensil_id: string;
  guarantor: {
    id: string;
    name: string;
    phone_number: string | null;
  } | null;
}

export interface PenaltyBreakdown {
  missing_quantity: number;
  price_per_item: number;
  missing_penalty: number;
  damage_penalty: number;
  total_penalty: number;
}

export interface ReturnResult extends UtensilRental {
  penalty_breakdown: PenaltyBreakdown;
}

export interface VoucherData {
  voucher_type: 'ISSUE' | 'RETURN';
  rental: UtensilRental;
  guarantor: { id: string; name: string; phone_number: string | null } | null;
  generated_at: string;
}

// ---- Inventory API ----

export const getUtensils = async (): Promise<UtensilItem[]> => {
  const res = await api.get('/api/utensils');
  return res.data.data;
};

export const getUtensilById = async (id: string): Promise<UtensilItem> => {
  const res = await api.get(`/api/utensils/${id}`);
  return res.data.data;
};

export const createUtensil = async (
  payload: Pick<UtensilItem, 'item_name' | 'stock_quantity' | 'rental_price' | 'description'>,
): Promise<UtensilItem> => {
  const res = await api.post('/api/utensils', payload);
  return res.data.data;
};

export const updateUtensil = async (
  id: string,
  payload: Partial<UtensilItem>,
): Promise<UtensilItem> => {
  const res = await api.put(`/api/utensils/${id}`, payload);
  return res.data.data;
};

export const deleteUtensil = async (id: string): Promise<void> => {
  await api.delete(`/api/utensils/${id}`);
};

// ---- Rental API ----

export const getOutstandingRentals = async (): Promise<OutstandingRental[]> => {
  const res = await api.get('/api/utensil-rentals/outstanding');
  return res.data.data;
};

export const getAllRentals = async (isReturned?: boolean): Promise<UtensilRental[]> => {
  const params = isReturned !== undefined ? `?is_returned=${isReturned}` : '';
  const res = await api.get(`/api/utensil-rentals${params}`);
  return res.data.data;
};

export const getRentalById = async (id: string): Promise<RentalDetail> => {
  const res = await api.get(`/api/utensil-rentals/${id}`);
  return res.data.data;
};

export const issueRental = async (payload: {
  utensil_id: string;
  customer_id: string;
  guarantor_id?: string;
  quantity: number;
  issue_date: string;
  notes?: string;
}): Promise<UtensilRental> => {
  const res = await api.post('/api/utensil-rentals/issue', payload);
  return res.data.data;
};

export const processReturn = async (
  rentalId: string,
  payload: {
    quantity_returned?: number;
    damage_description?: string;
    additional_penalty?: number;
    return_date?: string;
    notes?: string;
  },
): Promise<ReturnResult> => {
  const res = await api.post(`/api/utensil-rentals/${rentalId}/return`, payload);
  return res.data.data;
};

export const getRentalVoucher = async (id: string): Promise<VoucherData> => {
  const res = await api.get(`/api/utensil-rentals/${id}/voucher`);
  return res.data.data;
};
