import { api } from './api';

// For simplicity, defining types closely matching backend select statement
export type CommunicationLog = {
  id: string;
  channel: string;
  message_body: string;
  delivery_status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  person: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
  } | null;
};

export async function getCommunicationLogs(params?: {
  limit?: number;
  status?: string;
}): Promise<CommunicationLog[]> {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.status) query.append('status', params.status);

  const res = await api.get<{ success: boolean; data: CommunicationLog[] }>(
    `/api/communications/logs?${query.toString()}`,
  );
  return res.data.data;
}

export async function broadcastWhatsAppMessage(payload: {
  personIds: string[];
  messageBody: string;
}) {
  const res = await api.post<{ success: true; message: string; queuedCount: number }>(
    '/api/communications/broadcast',
    payload,
  );
  return res.data;
}

export type BroadcastCampaign = {
  id: string;
  name: string;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed';
  total_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  created_at: string;
};

export async function getCampaigns(): Promise<BroadcastCampaign[]> {
  const res = await api.get<{ success: boolean; data: BroadcastCampaign[] }>(
    '/api/communications/campaigns',
  );
  return res.data.data;
}

export async function createCampaign(payload: {
  name: string;
  templateId?: string;
  segmentFilter: any;
}) {
  const res = await api.post<{ success: boolean; data: BroadcastCampaign }>(
    '/api/communications/campaigns',
    payload,
  );
  return res.data.data;
}

export async function sendCampaign(id: string) {
  const res = await api.post<{ success: boolean; message: string; queuedCount: number }>(
    `/api/communications/campaigns/${id}/send`,
  );
  return res.data;
}
export type MessageTemplate = {
  id: string;
  template_name: string;
  template_body: string;
  header_text?: string;
  footer_text?: string;
  variables: string[];
  cta_buttons: any[];
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  approval_status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  meta_template_id?: string;
  language: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
};

export async function getTemplates(): Promise<MessageTemplate[]> {
  const res = await api.get<{ success: boolean; data: MessageTemplate[] }>('/api/templates');
  return res.data.data;
}

export async function getTemplate(id: string): Promise<MessageTemplate> {
  const res = await api.get<{ success: boolean; data: MessageTemplate }>(`/api/templates/${id}`);
  return res.data.data;
}

export async function createTemplate(payload: Partial<MessageTemplate>) {
  const res = await api.post<{ success: boolean; data: MessageTemplate }>(
    '/api/templates',
    payload,
  );
  return res.data.data;
}

export async function updateTemplate(id: string, payload: Partial<MessageTemplate>) {
  const res = await api.put<{ success: boolean; data: MessageTemplate }>(
    `/api/templates/${id}`,
    payload,
  );
  return res.data.data;
}

export async function deleteTemplate(id: string) {
  const res = await api.delete<{ success: boolean; message: string }>(`/api/templates/${id}`);
  return res.data;
}

export async function submitTemplate(id: string) {
  const res = await api.post<{ success: boolean; data: MessageTemplate }>(
    `/api/templates/${id}/submit`,
    {},
  );
  return res.data.data;
}
