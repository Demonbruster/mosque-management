// ============================================
// Persons API Wrappers (lightweight)
// ============================================

import { api } from './api';

export interface PersonSummary {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  category: string;
}

export const getPersons = async (search?: string): Promise<PersonSummary[]> => {
  const url = search
    ? `/api/persons/search?q=${encodeURIComponent(search)}`
    : `/api/persons?limit=200`;
  const res = await api.get(url);
  // Support both paginated and search response formats
  const data = res.data.data;
  return Array.isArray(data) ? data : (data?.persons ?? data?.data ?? []);
};

export const getSegment = async (filters: {
  zones?: string[];
  tags?: string[];
  category?: string;
  whatsappOptIn?: boolean;
}): Promise<{ count: number; data: PersonSummary[] }> => {
  const query = new URLSearchParams();
  if (filters.zones?.length) filters.zones.forEach((z) => query.append('zones[]', z));
  if (filters.tags?.length) filters.tags.forEach((t) => query.append('tags[]', t));
  if (filters.category) query.append('category', filters.category);
  if (filters.whatsappOptIn !== undefined)
    query.append('whatsapp_opt_in', String(filters.whatsappOptIn));

  const res = await api.get<{ success: true; count: number; data: PersonSummary[] }>(
    `/api/persons/segment?${query.toString()}`,
  );
  return { count: res.data.count, data: res.data.data };
};
export const getPerson = async (id: string): Promise<any> => {
  const res = await api.get(`/api/persons/${id}`);
  return res.data.data;
};
