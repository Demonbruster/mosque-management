// ============================================
// Roadmap Projects API Wrappers — TASK-026
// ============================================

import axios from 'axios';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || '';
const PUBLIC_TENANT_ID =
  import.meta.env.VITE_PUBLIC_TENANT_ID || '00000000-0000-0000-0000-000000000001';

// ─── Types ───────────────────────────────────────────────

export type ProjectPhase = 'Past' | 'Present' | 'Future';

export interface RoadmapProject {
  id: string;
  tenant_id: string;
  project_name: string;
  description: string | null;
  phase: ProjectPhase;
  estimated_budget: string | null; // decimal comes as string from API
  actual_spend: string | null;
  completion_percentage: number;
  start_date: string | null;
  target_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupedRoadmap {
  past: RoadmapProject[];
  present: RoadmapProject[];
  future: RoadmapProject[];
}

export interface RoadmapResponse {
  success: boolean;
  data: GroupedRoadmap;
  meta: { total: number };
}

// ─── Public API (no auth) ────────────────────────────────

export const getPublicRoadmap = async (tenantId?: string): Promise<GroupedRoadmap> => {
  const tid = tenantId || PUBLIC_TENANT_ID;
  const resp = await axios.get<RoadmapResponse>(`${API_URL}/api/public/roadmap?tenant_id=${tid}`);
  return resp.data.data;
};

// ─── Admin API (authenticated) ───────────────────────────

export const getProjects = async (phase?: ProjectPhase): Promise<RoadmapProject[]> => {
  const params = new URLSearchParams();
  if (phase) params.append('phase', phase);
  const resp = await api.get(`/api/projects?${params.toString()}`);
  return resp.data.data;
};

export const getProjectById = async (id: string): Promise<RoadmapProject> => {
  const resp = await api.get(`/api/projects/${id}`);
  return resp.data.data;
};

export interface CreateProjectPayload {
  project_name: string;
  description?: string;
  phase?: ProjectPhase;
  estimated_budget?: string;
  actual_spend?: string;
  completion_percentage?: number;
  start_date?: string;
  target_end_date?: string;
  notes?: string;
}

export const createProject = async (payload: CreateProjectPayload): Promise<RoadmapProject> => {
  const resp = await api.post('/api/projects', payload);
  return resp.data.data;
};

export const updateProject = async (
  id: string,
  payload: Partial<CreateProjectPayload>,
): Promise<RoadmapProject> => {
  const resp = await api.put(`/api/projects/${id}`, payload);
  return resp.data.data;
};

export const updateProjectPhase = async (
  id: string,
  phase: ProjectPhase,
): Promise<RoadmapProject> => {
  const resp = await api.patch(`/api/projects/${id}/phase`, { phase });
  return resp.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};
