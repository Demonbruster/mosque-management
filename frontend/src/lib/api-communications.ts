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
