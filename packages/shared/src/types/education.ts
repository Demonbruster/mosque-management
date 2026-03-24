// ============================================
// Education & Life Event Types
// ============================================

export type EnrollmentStatus = "Active" | "Completed" | "Dropped" | "Suspended";
export type EventType = "Marriage" | "Divorce" | "Death" | "Birth" | "Conversion";

export interface MadrasaClass {
  id: string;
  tenant_id: string;
  class_name: string;
  description: string | null;
  schedule: string | null;
  teacher_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  enrollment_date: string;
  status: EnrollmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LifeEventRecord {
  id: string;
  tenant_id: string;
  event_type: EventType;
  person_a_id: string;
  person_b_id: string | null;
  event_date: string;
  certificate_no: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
