// ============================================
// Fund Categories API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { fundCategories } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const fundCategoriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/fund-categories — List all active fund categories for the tenant
fundCategoriesRoutes.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(fundCategories)
    .where(and(eq(fundCategories.tenant_id, tenantId), eq(fundCategories.is_active, true)));

  return c.json({ success: true, data: result });
});

// POST /api/fund-categories — Admin creates new fund categories
fundCategoriesRoutes.post('/', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const result = await db
    .insert(fundCategories)
    .values({
      ...body,
      tenant_id: tenantId,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

export default fundCategoriesRoutes;
