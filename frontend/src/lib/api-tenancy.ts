// ============================================
// Tenancy API Wrappers
// ============================================

import { api } from './api';

export type AgreementStatus = 'Active' | 'Expired' | 'Terminated' | 'Pending';
export type PaymentMethod = 'Cash' | 'Google_Pay' | 'Bank_Transfer' | 'UPI' | 'Cheque';

export interface TenancyAgreement {
  id: string;
  rent_amount: string;
  security_deposit: string | null;
  start_date: string;
  end_date: string | null;
  status: AgreementStatus;
  notes: string | null;
  person: { id: string; first_name: string; last_name: string; phone_number?: string | null };
  asset: { id: string; name: string };
}

export interface RentPayment {
  id: string;
  agreement_id: string;
  amount_paid: string;
  discount_amount: string | null;
  discount_reason: string | null;
  payment_date: string;
  payment_method: PaymentMethod;
  month: number;
  year: number;
  notes: string | null;
  receipt_generated: boolean;
  created_at: string;
}

export interface TenancyAgreementDetail extends TenancyAgreement {
  payments: RentPayment[];
}

export interface OverdueAgreement {
  id: string;
  rent_amount: string;
  start_date: string;
  person_name: string;
  property_name: string;
  phone_number: string | null;
  is_overdue: boolean;
  last_payment: RentPayment | null;
}

export const getAgreements = async (): Promise<TenancyAgreement[]> => {
  const response = await api.get('/api/tenancy-agreements');
  return response.data.data;
};

export const getAgreementById = async (id: string): Promise<TenancyAgreementDetail> => {
  const response = await api.get(`/api/tenancy-agreements/${id}`);
  return response.data.data;
};

export const createAgreement = async (
  payload: Partial<TenancyAgreement> & { person_id: string; asset_id: string },
): Promise<TenancyAgreement> => {
  const response = await api.post('/api/tenancy-agreements', payload);
  return response.data.data;
};

export const recordRentPayment = async (
  agreementId: string,
  payload: {
    amount_paid: number;
    discount_amount?: number;
    discount_reason?: string;
    payment_date: string;
    payment_method: PaymentMethod;
    month: number;
    year: number;
    notes?: string;
  },
): Promise<RentPayment> => {
  const response = await api.post(`/api/tenancy-agreements/${agreementId}/rent-payment`, payload);
  return response.data.data;
};

export const terminateAgreement = async (
  agreementId: string,
  payload: {
    refund_amount: number;
    deductions: number;
    notes?: string;
  },
): Promise<TenancyAgreement> => {
  const response = await api.post(`/api/tenancy-agreements/${agreementId}/terminate`, payload);
  return response.data.data;
};

export const getRentDueReport = async (): Promise<OverdueAgreement[]> => {
  const response = await api.get('/api/tenancy-agreements/reports/rent-due');
  return response.data.data;
};

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
