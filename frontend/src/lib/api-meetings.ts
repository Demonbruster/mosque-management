// ============================================
// Meetings API Wrappers
// ============================================

import { api } from './api';
import type { MeetingLog } from '@mms/shared/src/types/governance';

export const getMeetings = async (filters?: { type?: string }): Promise<MeetingLog[]> => {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);

  const response = await api.get(`/api/meetings?${params.toString()}`);
  return response.data.data;
};

export const getMeetingById = async (id: string): Promise<MeetingLog> => {
  const response = await api.get(`/api/meetings/${id}`);
  return response.data.data;
};

export const createMeeting = async (
  payload: Omit<MeetingLog, 'id' | 'tenant_id' | 'is_locked' | 'created_at' | 'updated_at'>,
): Promise<MeetingLog> => {
  const response = await api.post('/api/meetings', payload);
  return response.data.data;
};

export const updateMeeting = async (
  id: string,
  payload: Partial<MeetingLog>,
): Promise<MeetingLog> => {
  const response = await api.put(`/api/meetings/${id}`, payload);
  return response.data.data;
};
