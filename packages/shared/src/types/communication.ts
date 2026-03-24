// ============================================
// Communication / Broadcasting Types
// ============================================

export type DeliveryStatus = "Sent" | "Delivered" | "Read" | "Failed";

export interface CommunicationLog {
  id: string;
  tenant_id: string;
  person_id: string;
  channel: string;
  message_template: string | null;
  message_body: string | null;
  delivery_status: DeliveryStatus;
  external_message_id: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}
