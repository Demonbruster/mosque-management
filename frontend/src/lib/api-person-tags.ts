import { api } from './api';

export const getPersonTags = async (): Promise<string[]> => {
  const res = await api.get<{ success: boolean; data: string[] }>('/api/person-tags');
  return res.data.data;
};

export const bulkAddPersonTag = async (payload: { personIds: string[]; tag: string }) => {
  const res = await api.post<{ success: boolean; addedCount: number }>(
    '/api/person-tags/bulk-add',
    payload,
  );
  return res.data;
};

export const bulkRemovePersonTag = async (payload: { personIds: string[]; tag: string }) => {
  const res = await api.delete<{ success: boolean; removedCount: number }>(
    '/api/person-tags/bulk-remove',
    { data: payload },
  );
  return res.data;
};
