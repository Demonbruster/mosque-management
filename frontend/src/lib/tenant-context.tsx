// ============================================
// Tenant Context — Global Mosque Settings
// ============================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { api } from './api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  currency: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantId, user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenant = async () => {
    if (!tenantId) {
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      // We use the authenticated endpoint if we have a user,
      // otherwise we could use the public resolution endpoint if needed.
      // But for administrative settings and currency formatting in the app,
      // we usually have a tenantId from the auth token.
      const res = await api.get(`/api/tenants/${tenantId}`);
      if (res.data.success) {
        setTenant(res.data.data);
      }
    } catch (error) {
      console.error('[TenantContext] Failed to fetch tenant details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [tenantId, user]);

  return (
    <TenantContext.Provider value={{ tenant, loading, refreshTenant: fetchTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
