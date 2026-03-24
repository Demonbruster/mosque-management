// ============================================
// Zustand Auth Store
// ============================================
// Lightweight auth state for components that don't
// need the full context. Synced from AuthProvider.

import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  uid: string | null;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  setAuth: (data: Omit<AuthState, "setAuth" | "clearAuth" | "isAuthenticated">) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  uid: null,
  email: null,
  role: null,
  tenantId: null,
  setAuth: (data) =>
    set({
      isAuthenticated: true,
      ...data,
    }),
  clearAuth: () =>
    set({
      isAuthenticated: false,
      uid: null,
      email: null,
      role: null,
      tenantId: null,
    }),
}));
