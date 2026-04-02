// ============================================
// Fixed Assets API Wrappers
// ============================================

import { api } from './api';

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type AssetDisposalMethod = 'Sold' | 'Donated' | 'Scrapped' | 'Returned';

export interface FixedAsset {
  id: string;
  unique_asset_id: string;
  name: string;
  description: string | null;
  condition: AssetCondition;
  fund_source: string | null;
  purchase_price: number | null;
  current_value: number | null;
  acquisition_date: string | null;
  warranty_expiry: string | null;
  amc_expiry: string | null;
  amc_vendor: string | null;
  is_active: boolean;
  disposal_date: string | null;
  disposal_method: AssetDisposalMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const getAssets = async (filters?: { fund_source?: string }): Promise<FixedAsset[]> => {
  const params = new URLSearchParams();
  if (filters?.fund_source) params.append('fund_source', filters.fund_source);

  const response = await api.get(`/api/assets?${params.toString()}`);
  return response.data.data;
};

export const getAssetById = async (id: string): Promise<FixedAsset> => {
  const response = await api.get(`/api/assets/${id}`);
  return response.data.data;
};

export const createAsset = async (payload: Partial<FixedAsset>): Promise<FixedAsset> => {
  const response = await api.post('/api/assets', payload);
  return response.data.data;
};

export const updateAsset = async (
  id: string,
  payload: Partial<FixedAsset>,
): Promise<FixedAsset> => {
  const response = await api.put(`/api/assets/${id}`, payload);
  return response.data.data;
};

export const disposeAsset = async (
  id: string,
  payload: { disposal_method: AssetDisposalMethod; disposal_date: string; reason?: string },
): Promise<FixedAsset> => {
  const response = await api.post(`/api/assets/${id}/dispose`, payload);
  return response.data.data;
};

export const getMaintenanceAlerts = async (): Promise<FixedAsset[]> => {
  const response = await api.get('/api/assets/maintenance-due');
  return response.data.data;
};
