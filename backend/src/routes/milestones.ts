// ============================================
// Milestones CRUD API Routes — TASK-027 (ST-27.2, ST-27.3)
// ============================================
// Protected endpoints — requires auth + tenant scope.
// Sub-resource of projects: /api/projects/:projectId/milestones
//
// Routes:
//   GET    /                  — List milestones for a project
//   GET    /:id               — Get single milestone
//   POST   /                  — Create milestone
//   PUT    /:id               — Update milestone
//   PATCH  /reorder           — Reorder milestones
//   DELETE /:id               — Delete milestone
//
// Auto-recalculates project completion_percentage on mutations.
// Auto-flags Delayed status on read.
// ============================================

import { Hono } from 'hono';
import { eq, and, asc, avg } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { projectMilestones, projectRoadmap } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const milestonesRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// -------------------------------------------------------
// Helper: Recalculate project completion percentage
// from the average of all its milestone percentages.
// -------------------------------------------------------
async function recalcProjectCompletion(
  db: ReturnType<typeof createDb>,
  projectId: string,
  tenantId: string,
) {
  const result = await db
    .select({ avgPct: avg(projectMilestones.completion_percentage) })
    .from(projectMilestones)
    .where(
      and(eq(projectMilestones.project_id, projectId), eq(projectMilestones.tenant_id, tenantId)),
    );

  const avgPct = result[0]?.avgPct ? Math.round(Number(result[0].avgPct)) : 0;

  await db
    .update(projectRoadmap)
    .set({ completion_percentage: avgPct, updated_at: new Date() })
    .where(and(eq(projectRoadmap.id, projectId), eq(projectRoadmap.tenant_id, tenantId)));

  return avgPct;
}

// -------------------------------------------------------
// Helper: Apply delayed status computation on read.
// A milestone is "Delayed" if target_date < today AND
// status is not 'Completed'.
// -------------------------------------------------------
type MilestoneRow = typeof projectMilestones.$inferSelect;

function computeEffectiveStatus(milestone: MilestoneRow): string {
  if (milestone.status === 'Completed') return 'Completed';

  if (milestone.target_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(milestone.target_date);
    if (target < today) return 'Delayed';
  }

  return milestone.status;
}

// -------------------------------------------------------
// GET / — List all milestones for a project
// -------------------------------------------------------
milestonesRoute.get('/', async (c) => {
  const projectId = c.req.param('projectId');
  if (!projectId) return c.json({ success: false, error: 'projectId is required' }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(projectMilestones)
    .where(
      and(eq(projectMilestones.project_id, projectId), eq(projectMilestones.tenant_id, tenantId)),
    )
    .orderBy(asc(projectMilestones.sort_order));

  const withStatus = result.map((ms) => ({
    ...ms,
    status: computeEffectiveStatus(ms),
  }));

  return c.json({ success: true, data: withStatus });
});

// -------------------------------------------------------
// GET /:id — Get single milestone
// -------------------------------------------------------
milestonesRoute.get('/:id', async (c) => {
  const projectId = c.req.param('projectId');
  const id = c.req.param('id');
  if (!projectId || !id) return c.json({ success: false, error: 'Missing params' }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(projectMilestones)
    .where(
      and(
        eq(projectMilestones.id, id),
        eq(projectMilestones.project_id, projectId),
        eq(projectMilestones.tenant_id, tenantId),
      ),
    );

  if (result.length === 0) {
    return c.json({ success: false, error: 'Milestone not found' }, 404);
  }

  const ms = result[0];
  return c.json({ success: true, data: { ...ms, status: computeEffectiveStatus(ms) } });
});

// -------------------------------------------------------
// POST / — Create a new milestone
// -------------------------------------------------------
milestonesRoute.post('/', async (c) => {
  const projectId = c.req.param('projectId');
  if (!projectId) return c.json({ success: false, error: 'projectId is required' }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  if (!body.milestone_name) {
    return c.json({ success: false, error: 'milestone_name is required' }, 400);
  }

  // Verify project belongs to tenant
  const project = await db
    .select({ id: projectRoadmap.id })
    .from(projectRoadmap)
    .where(and(eq(projectRoadmap.id, projectId), eq(projectRoadmap.tenant_id, tenantId)));

  if (project.length === 0) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  // Determine next sort_order
  const existing = await db
    .select({ sort_order: projectMilestones.sort_order })
    .from(projectMilestones)
    .where(
      and(eq(projectMilestones.project_id, projectId), eq(projectMilestones.tenant_id, tenantId)),
    )
    .orderBy(asc(projectMilestones.sort_order));

  const nextSort = existing.length > 0 ? (existing[existing.length - 1].sort_order ?? 0) + 1 : 0;

  const result = await db
    .insert(projectMilestones)
    .values({
      tenant_id: tenantId,
      project_id: projectId,
      milestone_name: String(body.milestone_name),
      description: body.description ?? null,
      target_date: body.target_date ?? null,
      completion_date: body.completion_date ?? null,
      completion_percentage: Number(body.completion_percentage ?? 0),
      status: body.status ?? 'Not_Started',
      sort_order: body.sort_order ?? nextSort,
    })
    .returning();

  // ST-27.3: Auto-recalculate project completion
  const newProjectPct = await recalcProjectCompletion(db, projectId, tenantId);

  return c.json(
    { success: true, data: result[0], meta: { project_completion_percentage: newProjectPct } },
    201,
  );
});

// -------------------------------------------------------
// PUT /:id — Update a milestone
// -------------------------------------------------------
milestonesRoute.put('/:id', async (c) => {
  const projectId = c.req.param('projectId');
  const id = c.req.param('id');
  if (!projectId || !id) return c.json({ success: false, error: 'Missing params' }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  // Strip immutable fields
  const { tenant_id, id: _id, project_id, created_at, ...updateData } = body;
  // avoid "defined but never used" by just destructuring what we need or ignoring them
  void tenant_id;
  void _id;
  void project_id;
  void created_at;

  // Auto-set Completed if 100%
  if (updateData.completion_percentage === 100 && !updateData.status) {
    updateData.status = 'Completed';
  }
  if (updateData.status === 'Completed' && !updateData.completion_date) {
    updateData.completion_date = new Date().toISOString().split('T')[0];
  }

  const result = await db
    .update(projectMilestones)
    .set({ ...updateData, updated_at: new Date() })
    .where(
      and(
        eq(projectMilestones.id, id),
        eq(projectMilestones.project_id, projectId),
        eq(projectMilestones.tenant_id, tenantId),
      ),
    )
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Milestone not found' }, 404);
  }

  // ST-27.3: Auto-recalculate
  const newProjectPct = await recalcProjectCompletion(db, projectId, tenantId);

  return c.json({
    success: true,
    data: { ...result[0], status: computeEffectiveStatus(result[0]) },
    meta: { project_completion_percentage: newProjectPct },
  });
});

// -------------------------------------------------------
// PATCH /reorder — Reorder milestones via array of IDs
// -------------------------------------------------------
milestonesRoute.patch('/reorder', async (c) => {
  const projectId = c.req.param('projectId');
  if (!projectId) return c.json({ success: false, error: 'projectId is required' }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const { ids } = body as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ success: false, error: 'ids must be a non-empty array' }, 400);
  }

  await Promise.all(
    ids.map((msId: string, index: number) =>
      db
        .update(projectMilestones)
        .set({ sort_order: index, updated_at: new Date() })
        .where(
          and(
            eq(projectMilestones.id, msId),
            eq(projectMilestones.project_id, projectId),
            eq(projectMilestones.tenant_id, tenantId),
          ),
        ),
    ),
  );

  return c.json({ success: true, data: { reordered: ids.length } });
});

// -------------------------------------------------------
// DELETE /:id — Delete a milestone
// -------------------------------------------------------
milestonesRoute.delete('/:id', async (c) => {
  const projectId = c.req.param('projectId');
  const id = c.req.param('id');
  if (!projectId || !id) return c.json({ success: false, error: 'Missing params' }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .delete(projectMilestones)
    .where(
      and(
        eq(projectMilestones.id, id),
        eq(projectMilestones.project_id, projectId),
        eq(projectMilestones.tenant_id, tenantId),
      ),
    )
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Milestone not found' }, 404);
  }

  const newProjectPct = await recalcProjectCompletion(db, projectId, tenantId);

  return c.json({
    success: true,
    data: { deleted: true },
    meta: { project_completion_percentage: newProjectPct },
  });
});

export default milestonesRoute;
