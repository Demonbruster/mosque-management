// ============================================
// Person Types
// ============================================

export type PersonCategory = "Member" | "Non-Member" | "Dependent" | "Staff" | "Hifl";

export interface Person {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  dob: string | null;
  gender: "male" | "female" | "other" | null;
  category: PersonCategory;
  whatsapp_opt_in: boolean;
  national_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreatePersonInput = Omit<Person, "id" | "created_at" | "updated_at">;
export type UpdatePersonInput = Partial<CreatePersonInput>;
