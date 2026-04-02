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
