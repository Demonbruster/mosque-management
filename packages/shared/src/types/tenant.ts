export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateTenantInput = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTenantInput = Partial<CreateTenantInput>;
