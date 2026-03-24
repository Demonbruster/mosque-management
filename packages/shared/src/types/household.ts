// ============================================
// Household, Person-Household Link & Relationship Types
// ============================================

export interface Household {
  id: string;
  tenant_id: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  mahalla_zone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type HouseholdRole = "Head" | "Spouse" | "Dependent";

export interface PersonHouseholdLink {
  id: string;
  person_id: string;
  household_id: string;
  household_role: HouseholdRole;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RelationshipCode =
  | "Parent"
  | "Child"
  | "Sibling"
  | "Spouse"
  | "Grandparent"
  | "Grandchild"
  | "Uncle"
  | "Aunt"
  | "Cousin"
  | "Other";

export interface PersonRelationship {
  id: string;
  person_id_a: string;
  person_id_b: string;
  relationship_code: RelationshipCode;
  created_at: string;
}

export type CreateHouseholdInput = Omit<Household, "id" | "created_at" | "updated_at">;
export type CreatePersonHouseholdLinkInput = Omit<PersonHouseholdLink, "id" | "created_at" | "updated_at">;
export type CreatePersonRelationshipInput = Omit<PersonRelationship, "id" | "created_at">;
