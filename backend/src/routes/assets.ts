// ============================================
// Fixed Assets API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, or, lte, gte } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { fixedAssets } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const assetsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/assets/maintenance-due — Get assets with expiring warranties or AMCs
assetsRoute.get('/maintenance-due', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  // Next 30 days window
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  const result = await db
    .select()
    .from(fixedAssets)
    .where(
      and(
        eq(fixedAssets.tenant_id, tenantId),
        eq(fixedAssets.is_active, true),
        or(
          and(
            gte(fixedAssets.warranty_expiry, now.toISOString().split('T')[0]),
            lte(fixedAssets.warranty_expiry, next30Days.toISOString().split('T')[0]),
          ),
          and(
            gte(fixedAssets.amc_expiry, now.toISOString().split('T')[0]),
            lte(fixedAssets.amc_expiry, next30Days.toISOString().split('T')[0]),
          ),
        ),
      ),
    );

  return c.json({ success: true, data: result });
});

// GET /api/assets — List all active fixed assets
assetsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const fundSource = c.req.query('fund_source');

  const conditions = [eq(fixedAssets.tenant_id, tenantId), eq(fixedAssets.is_active, true)];

  if (fundSource) {
    conditions.push(eq(fixedAssets.fund_source, fundSource));
  }

  const result = await db
    .select()
    .from(fixedAssets)
    .where(and(...conditions));

  return c.json({ success: true, data: result });
});

// GET /api/assets/:id — Get details of a single asset
assetsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(fixedAssets)
    .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenant_id, tenantId)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Asset not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// POST /api/assets — Create a new asset
assetsRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  // Very basic unique ID generation if not provided
  if (!body.unique_asset_id) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 7).replace('-', '');
    body.unique_asset_id = `AST-${datePrefix}-${randomSuffix}`;
  }

  const result = await db
    .insert(fixedAssets)
    .values({ ...body, tenant_id: tenantId })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// PUT /api/assets/:id — Update an asset
assetsRoute.put('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const result = await db
    .update(fixedAssets)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Asset not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// DELETE /api/assets/:id — Soft delete an asset
assetsRoute.delete('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .update(fixedAssets)
    .set({ is_active: false, updated_at: new Date() })
    .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Asset not found' }, 404);
  }

  return c.json({ success: true, data: { deleted: true } });
});

// POST /api/assets/:id/dispose — Dispose of an asset
assetsRoute.post('/:id/dispose', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const { disposal_method, disposal_date, reason } = body;

  // Retrieve current notes to append the reason
  const assetsInfo = await db
    .select({ notes: fixedAssets.notes })
    .from(fixedAssets)
    .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenant_id, tenantId)));

  if (assetsInfo.length === 0) {
    return c.json({ success: false, error: 'Asset not found' }, 404);
  }

  const existingNotes = assetsInfo[0].notes || '';
  const mergedNotes = reason
    ? `${existingNotes}\n[Disposal Reason]: ${reason}`.trim()
    : existingNotes;

  const result = await db
    .update(fixedAssets)
    .set({
      is_active: false,
      disposal_method,
      disposal_date,
      notes: mergedNotes,
      updated_at: new Date(),
    })
    .where(and(eq(fixedAssets.id, id), eq(fixedAssets.tenant_id, tenantId)))
    .returning();

  return c.json({ success: true, data: result[0] });
});

export default assetsRoute;
