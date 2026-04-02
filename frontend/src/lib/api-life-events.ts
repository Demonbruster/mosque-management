import { api } from './api';
import { firebaseAuth } from './firebase';

export interface LifeEventRecord {
  id: string;
  tenant_id: string;
  event_type: 'Marriage' | 'Divorce' | 'Death' | 'Birth' | 'Conversion';
  person_a_id: string;
  person_b_id: string | null;
  event_date: string;
  certificate_no: string | null;
  location: string | null;
  document_urls: string[] | null;
  notes: string | null;
  created_at: string;
}

export type CreateLifeEventInput = Omit<
  LifeEventRecord,
  'id' | 'tenant_id' | 'certificate_no' | 'created_at'
>;

export async function fetchLifeEvents(filters?: {
  event_type?: string;
  person_id?: string;
}): Promise<LifeEventRecord[]> {
  const queryParams = new URLSearchParams();
  if (filters?.event_type) queryParams.append('event_type', filters.event_type);
  if (filters?.person_id) queryParams.append('person_id', filters.person_id);

  const qs = queryParams.toString();
  const url = qs ? `/api/life-events?${qs}` : '/api/life-events';

  const response = await api.get(url);
  if (!response.data.success) throw new Error(response.data.error || 'Failed to fetch life events');
  return response.data.data;
}

export async function fetchLifeEvent(id: string): Promise<LifeEventRecord> {
  const response = await api.get(`/api/life-events/${id}`);
  if (!response.data.success) throw new Error(response.data.error || 'Failed to fetch life event');
  return response.data.data;
}

export async function createLifeEvent(data: CreateLifeEventInput): Promise<LifeEventRecord> {
  const response = await api.post('/api/life-events', data);
  if (!response.data.success) throw new Error(response.data.error || 'Failed to create life event');
  return response.data.data;
}

export function getCertificateUrl(id: string): string {
  return `/api/life-events/${id}/certificate`;
}

export async function downloadCertificateBlob(id: string): Promise<Blob> {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const url = import.meta.env.VITE_API_URL + `/api/life-events/${id}/certificate`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to download certificate');
  return await res.blob();
}
