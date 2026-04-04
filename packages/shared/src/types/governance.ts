// ============================================
// Governance Types
// ============================================

export type ProjectPhase = 'Past' | 'Present' | 'Future';
export type MeetingType = 'Jamath' | 'Management' | 'Panchayath';
export type PanchayathCaseStatus = 'Open' | 'In_Progress' | 'Resolved' | 'Dismissed';

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

export interface PanchayathCase {
  id: string;
  tenant_id: string;
  case_id: string;
  complainant_id: string;
  respondent_id: string | null;
  subject: string;
  status: PanchayathCaseStatus;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  // relations
  complainant?: {
    first_name: string;
    last_name: string;
  };
  respondent?: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface PanchayathSession {
  id: string;
  tenant_id: string;
  case_id: string;
  session_date: string;
  notes: string | null;
  next_steps: string | null;
  created_at: string;
  updated_at: string;
}
