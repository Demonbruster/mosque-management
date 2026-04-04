// ============================================
// Panchayath API Wrappers
// ============================================

import { api } from './api';
import type { PanchayathCase, PanchayathSession } from '@mms/shared/src/types/governance';

export const getPanchayathCases = async (): Promise<PanchayathCase[]> => {
  const response = await api.get('/api/panchayath');
  return response.data.data;
};

export const getPanchayathCaseById = async (
  id: string,
): Promise<PanchayathCase & { sessions: PanchayathSession[] }> => {
  const response = await api.get(`/api/panchayath/${id}`);
  return response.data.data;
};

export const createPanchayathCase = async (
  payload: Omit<
    PanchayathCase,
    | 'id'
    | 'tenant_id'
    | 'status'
    | 'resolution_notes'
    | 'created_at'
    | 'updated_at'
    | 'complainant'
    | 'respondent'
  >,
): Promise<PanchayathCase> => {
  const response = await api.post('/api/panchayath', payload);
  return response.data.data;
};

export const updatePanchayathCase = async (
  id: string,
  payload: Partial<PanchayathCase>,
): Promise<PanchayathCase> => {
  const response = await api.put(`/api/panchayath/${id}`, payload);
  return response.data.data;
};

export const createPanchayathSession = async (
  caseId: string,
  payload: Omit<PanchayathSession, 'id' | 'tenant_id' | 'case_id' | 'created_at' | 'updated_at'>,
): Promise<PanchayathSession> => {
  const response = await api.post(`/api/panchayath/${caseId}/sessions`, payload);
  return response.data.data;
};
