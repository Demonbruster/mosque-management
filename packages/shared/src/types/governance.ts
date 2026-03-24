// ============================================
// Governance Types
// ============================================

export type ProjectPhase = "Past" | "Present" | "Future";
export type MeetingType = "Jamath" | "Management" | "Panchayath";

export interface ProjectRoadmap {
  id: string;
  tenant_id: string;
  project_name: string;
  description: string | null;
  phase: ProjectPhase;
  estimated_budget: number | null;
  actual_spend: number | null;
  completion_percentage: number;
  start_date: string | null;
  target_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingLog {
  id: string;
  tenant_id: string;
  meeting_type: MeetingType;
  meeting_date: string;
  title: string | null;
  minutes_text: string | null;
  attendees_count: number | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManagementCommittee {
  id: string;
  tenant_id: string;
  person_id: string;
  role_title: string;
  tenure_start: string;
  tenure_end: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
