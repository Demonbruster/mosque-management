// ============================================
// Roadmap Projects API Wrappers — TASK-026 + TASK-027
// ============================================

import axios from 'axios';
import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || '';
const PUBLIC_TENANT_ID =
  import.meta.env.VITE_PUBLIC_TENANT_ID || '00000000-0000-0000-0000-000000000001';

// ─── Types ───────────────────────────────────────────────

export type ProjectPhase = 'Past' | 'Present' | 'Future';

// ST-27.1
export type MilestoneStatus = 'Not_Started' | 'In_Progress' | 'Completed' | 'Delayed';

export interface ProjectMilestone {
  id: string;
  tenant_id: string;
  project_id: string;
  milestone_name: string;
  description: string | null;
  target_date: string | null;
  completion_date: string | null;
  completion_percentage: number;
  status: MilestoneStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestonePayload {
  milestone_name: string;
  description?: string;
  target_date?: string;
  completion_date?: string;
  completion_percentage?: number;
  status?: MilestoneStatus;
  sort_order?: number;
}

export interface RoadmapProject {
  id: string;
  tenant_id: string;
  project_name: string;
  description: string | null;
  phase: ProjectPhase;
  estimated_budget: string | null;
  actual_spend: string | null;
  completion_percentage: number;
  start_date: string | null;
  target_end_date: string | null;
  // ST-27.4
  project_incharge: string | null;
  incharge_name?: string | null;
  incharge_phone?: string | null;
  incharge_email?: string | null;
  // ST-27.1
  milestones?: ProjectMilestone[];
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

// ─── Admin Projects API (authenticated) ─────────────────

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
  project_incharge?: string | null;
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

// ─── Milestones API (authenticated) ──────────────────────

export const getMilestones = async (projectId: string): Promise<ProjectMilestone[]> => {
  const resp = await api.get(`/api/projects/${projectId}/milestones`);
  return resp.data.data;
};

export const getMilestone = async (
  projectId: string,
  milestoneId: string,
): Promise<ProjectMilestone> => {
  const resp = await api.get(`/api/projects/${projectId}/milestones/${milestoneId}`);
  return resp.data.data;
};

export const createMilestone = async (
  projectId: string,
  payload: CreateMilestonePayload,
): Promise<ProjectMilestone> => {
  const resp = await api.post(`/api/projects/${projectId}/milestones`, payload);
  return resp.data.data;
};

export const updateMilestone = async (
  projectId: string,
  milestoneId: string,
  payload: Partial<CreateMilestonePayload>,
): Promise<ProjectMilestone> => {
  const resp = await api.put(`/api/projects/${projectId}/milestones/${milestoneId}`, payload);
  return resp.data.data;
};

export const reorderMilestones = async (projectId: string, ids: string[]): Promise<void> => {
  await api.patch(`/api/projects/${projectId}/milestones/reorder`, { ids });
};

export const deleteMilestone = async (projectId: string, milestoneId: string): Promise<void> => {
  await api.delete(`/api/projects/${projectId}/milestones/${milestoneId}`);
};

// ─── Financials API (authenticated) ──────────────────────

export interface ProjectFinancialSummary {
  total_receipts: number;
  total_payments: number;
  balance: number;
  estimated_budget: number;
  budget_utilization: number;
}

export const getProjectFinancialSummary = async (id: string): Promise<ProjectFinancialSummary> => {
  const resp = await api.get(`/api/projects/${id}/financial-summary`);
  return resp.data.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProjectTransactions = async (id: string): Promise<any[]> => {
  const resp = await api.get(`/api/projects/${id}/transactions`);
  return resp.data.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProjectFinancialAnalysis = async (): Promise<any[]> => {
  const resp = await api.get('/api/projects/analysis/financials');
  return resp.data.data;
};
