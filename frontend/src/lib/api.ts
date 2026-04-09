// ============================================
// API Client — Axios + React Query
// ============================================

import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';
import { firebaseAuth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Axios instance with automatic Firebase Auth token injection.
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — could trigger sign out or refresh
      console.warn('[API] Unauthorized — token may be expired');
    }
    return Promise.reject(error);
  },
);

/**
 * React Query client with sensible defaults.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
