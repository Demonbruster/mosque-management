// ============================================
// Admin Projects CRUD API Routes — TASK-026 + TASK-027
// ============================================
// Protected endpoints — requires auth + tenant scope.
// Provides full CRUD for managing roadmap projects and
// moving them between phases (Past / Present / Future).
// ST-27.4: Added project_incharge FK to persons.
//
// Routes:
//   GET    /api/projects         — List all projects
//   GET    /api/projects/:id     — Get single project + milestones
//   POST   /api/projects         — Create project
//   PUT    /api/projects/:id     — Update project
//   PATCH  /api/projects/:id/phase — Move project phase
//   DELETE /api/projects/:id     — Delete project
// ============================================

import { Hono } from 'hono';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import {
  projectRoadmap,
  projectMilestones,
  persons,
  transactions,
  fundCategories,
} from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const projectsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Helper: compute delayed status for a milestone
function computeMilestoneStatus(ms: typeof projectMilestones.$inferSelect): string {
  if (ms.status === 'Completed') return 'Completed';
  if (ms.target_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(ms.target_date) < today) return 'Delayed';
  }
  return ms.status;
}

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

  // Join with persons to get incharge name
  const result = await db
    .select({
      project: projectRoadmap,
      incharge_first_name: persons.first_name,
      incharge_last_name: persons.last_name,
      incharge_phone: persons.phone_number,
    })
    .from(projectRoadmap)
    .leftJoin(persons, eq(projectRoadmap.project_incharge, persons.id))
    .where(and(...conditions))
    .orderBy(desc(projectRoadmap.created_at));

  const data = result.map((r) => ({
    ...r.project,
    incharge_name: r.incharge_first_name
      ? `${r.incharge_first_name} ${r.incharge_last_name ?? ''}`.trim()
      : null,
    incharge_phone: r.incharge_phone ?? null,
  }));

  return c.json({ success: true, data });
});

// -------------------------------------------------------
// GET /api/projects/analysis/financials — Cross-project performance
// -------------------------------------------------------
projectsRoute.get('/analysis/financials', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const projects = await db
    .select({
      id: projectRoadmap.id,
      project_name: projectRoadmap.project_name,
      estimated_budget: projectRoadmap.estimated_budget,
      actual_receipts: sql<number>`COALESCE((SELECT SUM(amount) FROM ${transactions} WHERE project_id = ${projectRoadmap.id} AND type = 'Income' AND status = 'Approved'), 0)`,
      actual_payments: sql<number>`COALESCE((SELECT SUM(amount) FROM ${transactions} WHERE project_id = ${projectRoadmap.id} AND type = 'Expense' AND status = 'Approved'), 0)`,
    })
    .from(projectRoadmap)
    .where(eq(projectRoadmap.tenant_id, tenantId));

  const data = projects.map((p) => {
    const balance = Number(p.actual_receipts) - Number(p.actual_payments);
    const budget = Number(p.estimated_budget || 0);
    const utilization = budget > 0 ? (Number(p.actual_payments) / budget) * 100 : 0;

    return {
      ...p,
      budget,
      actual_receipts: Number(p.actual_receipts),
      actual_payments: Number(p.actual_payments),
      balance,
      utilization: parseFloat(utilization.toFixed(2)),
    };
  });

  return c.json({ success: true, data });
});

// -------------------------------------------------------
// GET /api/projects/:id — Get single project with milestones
// -------------------------------------------------------
projectsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const projectResult = await db
    .select({
      project: projectRoadmap,
      incharge_first_name: persons.first_name,
      incharge_last_name: persons.last_name,
      incharge_phone: persons.phone_number,
      incharge_email: persons.email,
    })
    .from(projectRoadmap)
    .leftJoin(persons, eq(projectRoadmap.project_incharge, persons.id))
    .where(and(eq(projectRoadmap.id, id), eq(projectRoadmap.tenant_id, tenantId)));

  if (projectResult.length === 0) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  const r = projectResult[0];

  // Fetch milestones
  const milestones = await db
    .select()
    .from(projectMilestones)
    .where(and(eq(projectMilestones.project_id, id), eq(projectMilestones.tenant_id, tenantId)))
    .orderBy(asc(projectMilestones.sort_order));

  const milestoneWithStatus = milestones.map((ms) => ({
    ...ms,
    status: computeMilestoneStatus(ms),
  }));

  return c.json({
    success: true,
    data: {
      ...r.project,
      incharge_name: r.incharge_first_name
        ? `${r.incharge_first_name} ${r.incharge_last_name ?? ''}`.trim()
        : null,
      incharge_phone: r.incharge_phone ?? null,
      incharge_email: r.incharge_email ?? null,
      milestones: milestoneWithStatus,
    },
  });
});

// -------------------------------------------------------
// GET /api/projects/:id/financial-summary
// -------------------------------------------------------
projectsRoute.get('/:id/financial-summary', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const [project] = await db
    .select({ estimated_budget: projectRoadmap.estimated_budget })
    .from(projectRoadmap)
    .where(and(eq(projectRoadmap.id, id), eq(projectRoadmap.tenant_id, tenantId)))
    .limit(1);

  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404);
  }

  const txns = await db
    .select({
      type: transactions.type,
      total: sql<number>`SUM(amount)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.project_id, id),
        eq(transactions.tenant_id, tenantId),
        eq(transactions.status, 'Approved'),
      ),
    )
    .groupBy(transactions.type);

  let total_receipts = 0;
  let total_payments = 0;

  txns.forEach((t) => {
    if (t.type === 'Income') total_receipts = Number(t.total);
    if (t.type === 'Expense') total_payments = Number(t.total);
  });

  const balance = total_receipts - total_payments;
  const budget = Number(project.estimated_budget || 0);
  const budget_utilization = budget > 0 ? (total_payments / budget) * 100 : 0;

  return c.json({
    success: true,
    data: {
      total_receipts,
      total_payments,
      balance,
      estimated_budget: budget,
      budget_utilization: parseFloat(budget_utilization.toFixed(2)),
    },
  });
});

// -------------------------------------------------------
// GET /api/projects/:id/transactions
// -------------------------------------------------------
projectsRoute.get('/:id/transactions', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      type: transactions.type,
      payment_method: transactions.payment_method,
      status: transactions.status,
      description: transactions.description,
      donor_name: transactions.donor_name,
      transaction_date: transactions.transaction_date,
      fund_name: fundCategories.fund_name,
    })
    .from(transactions)
    .leftJoin(fundCategories, eq(transactions.fund_id, fundCategories.id))
    .where(
      and(
        eq(transactions.project_id, id),
        eq(transactions.tenant_id, tenantId),
        eq(transactions.status, 'Approved'),
      ),
    )
    .orderBy(desc(transactions.transaction_date));

  return c.json({ success: true, data: result });
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
      project_incharge: body.project_incharge ?? null,
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

  const { tenant_id, id: _id, created_at, ...updateData } = body;
  void tenant_id;
  void _id;
  void created_at;

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
