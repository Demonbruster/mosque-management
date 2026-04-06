// ============================================
// Admin Projects CRUD API Routes — TASK-026  (ST-26.2)
// ============================================
// Protected endpoints — requires auth + tenant scope.
// Provides full CRUD for managing roadmap projects and
// moving them between phases (Past / Present / Future).
//
// Routes:
//   GET    /api/projects         — List all projects
//   GET    /api/projects/:id     — Get single project
//   POST   /api/projects         — Create project
//   PUT    /api/projects/:id     — Update project
//   PATCH  /api/projects/:id/phase — Move project phase
//   DELETE /api/projects/:id     — Soft-delete (remove)
// ============================================

import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { projectRoadmap } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const projectsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// -------------------------------------------------------
// GET /api/projects — List all projects for the tenant
// -------------------------------------------------------
projectsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const phaseFilter = c.req.query('phase');

  const conditions = [eq(projectRoadmap.tenant_id, tenantId)];

  if (phaseFilter && ['Past', 'Present', 'Future'].includes(phaseFilter)) {
    conditions.push(eq(projectRoadmap.phase, phaseFilter as 'Past' | 'Present' | 'Future'));
  }

  const result = await db
    .select()
    .from(projectRoadmap)
    .where(and(...conditions))
    .orderBy(desc(projectRoadmap.created_at));

  return c.json({ success: true, data: result });
});

// -------------------------------------------------------
// GET /api/projects/:id — Get single project
// -------------------------------------------------------
projectsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(projectRoadmap)
    .where(and(eq(projectRoadmap.id, id), eq(projectRoadmap.tenant_id, tenantId)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// -------------------------------------------------------
// POST /api/projects — Create a new project
// -------------------------------------------------------
projectsRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  if (!body.project_name) {
    return c.json({ success: false, error: 'project_name is required' }, 400);
  }

  const result = await db
    .insert(projectRoadmap)
    .values({
      tenant_id: tenantId,
      project_name: body.project_name,
      description: body.description ?? null,
      phase: body.phase ?? 'Future',
      estimated_budget: body.estimated_budget ?? null,
      actual_spend: body.actual_spend ?? null,
      completion_percentage: body.completion_percentage ?? 0,
      start_date: body.start_date ?? null,
      target_end_date: body.target_end_date ?? null,
      notes: body.notes ?? null,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// -------------------------------------------------------
// PUT /api/projects/:id — Update a project
// -------------------------------------------------------
projectsRoute.put('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  // Strip tenant_id and id from the update payload for safety
  const { tenant_id: _t, id: _i, created_at: _c, ...updateData } = body;

  const result = await db
    .update(projectRoadmap)
    .set({ ...updateData, updated_at: new Date() })
    .where(and(eq(projectRoadmap.id, id), eq(projectRoadmap.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// -------------------------------------------------------
// PATCH /api/projects/:id/phase — Move project to a new phase
// -------------------------------------------------------
projectsRoute.patch('/:id/phase', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const { phase } = body;
  if (!phase || !['Past', 'Present', 'Future'].includes(phase)) {
    return c.json({ success: false, error: 'phase must be one of: Past, Present, Future' }, 400);
  }

  // When moving to Past, auto-set completion to 100%
  const extraFields: Record<string, unknown> = {};
  if (phase === 'Past') {
    extraFields.completion_percentage = 100;
  }

  const result = await db
    .update(projectRoadmap)
    .set({ phase, ...extraFields, updated_at: new Date() })
    .where(and(eq(projectRoadmap.id, id), eq(projectRoadmap.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// -------------------------------------------------------
// DELETE /api/projects/:id — Delete a project
// -------------------------------------------------------
projectsRoute.delete('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .delete(projectRoadmap)
    .where(and(eq(projectRoadmap.id, id), eq(projectRoadmap.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  return c.json({ success: true, data: { deleted: true } });
});

export default projectsRoute;
