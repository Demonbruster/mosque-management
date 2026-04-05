// ============================================
// Automation Flow API — TASK-020
// ============================================

import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { automationFlows } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = {
  user: AuthUser;
  tenantId: string;
};

const automationRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * GET /api/automations
 * Lists all flows for the tenant.
 */
automationRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId') as string;

  if (!tenantId) {
    return c.json({ error: 'Tenant ID not found' }, 401);
  }

  const flows = await db
    .select()
    .from(automationFlows)
    .where(eq(automationFlows.tenant_id, tenantId))
    .orderBy(desc(automationFlows.updated_at));

  return c.json(flows);
});

/**
 * GET /api/automations/:id
 * Gets a specific flow.
 */
automationRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId') as string;
  const id = c.req.param('id');

  const [flow] = await db
    .select()
    .from(automationFlows)
    .where(and(eq(automationFlows.id, id), eq(automationFlows.tenant_id, tenantId)))
    .limit(1);

  if (!flow) {
    return c.json({ error: 'Flow not found' }, 404);
  }

  return c.json(flow);
});

/**
 * POST /api/automations
 * Creates a new flow.
 */
automationRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId') as string;
  const body = await c.req.json();

  if (!tenantId) {
    return c.json({ error: 'Tenant ID not found' }, 401);
  }

  const [newFlow] = await db
    .insert(automationFlows)
    .values({
      ...body,
      tenant_id: tenantId,
      is_system: false, // Only manual flows allowed via API
    })
    .returning();

  return c.json(newFlow, 201);
});

/**
 * PATCH /api/automations/:id
 * Updates a flow.
 */
automationRoute.patch('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId') as string;
  const id = c.req.param('id');
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(automationFlows)
    .where(and(eq(automationFlows.id, id), eq(automationFlows.tenant_id, tenantId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Flow not found' }, 404);
  }

  if (existing.is_system) {
    return c.json({ error: 'Cannot modify system flows' }, 403);
  }

  const [updated] = await db
    .update(automationFlows)
    .set({
      ...body,
      updated_at: new Date(),
    })
    .where(eq(automationFlows.id, id))
    .returning();

  return c.json(updated);
});

/**
 * DELETE /api/automations/:id
 * Deletes a flow.
 */
automationRoute.delete('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId') as string;
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(automationFlows)
    .where(and(eq(automationFlows.id, id), eq(automationFlows.tenant_id, tenantId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Flow not found' }, 404);
  }

  if (existing.is_system) {
    return c.json({ error: 'Cannot delete system flows' }, 403);
  }

  await db.delete(automationFlows).where(eq(automationFlows.id, id));

  return c.json({ success: true });
});

export default automationRoute;
