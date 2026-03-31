// ============================================
// Tenants API Routes (Admin Only)
// ============================================

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { tenants, fundCategories } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const tenantsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// All tenant management requires admin role
tenantsRoute.use('/*', requireRole('admin'));

// GET /api/tenants — List all tenants
tenantsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const result = await db.select().from(tenants);
  return c.json({ success: true, data: result });
});

// GET /api/tenants/:id — Get a single tenant
tenantsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const result = await db.select().from(tenants).where(eq(tenants.id, id));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Tenant not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// POST /api/tenants — Provision a new mosque tenant
tenantsRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();

  if (!body.name || !body.slug) {
    return c.json({ success: false, error: 'Name and slug are required' }, 400);
  }

  try {
    const [newTenant] = await db
      .insert(tenants)
      .values({ ...body, is_active: true })
      .returning();

    // Seed default fund categories for the new tenant
    const defaultCategories: (typeof fundCategories.$inferInsert)[] = [
      {
        tenant_id: newTenant.id,
        fund_name: 'Zakat',
        compliance_type: 'ZAKAT',
        description: 'Mandatory Alms',
      },
      {
        tenant_id: newTenant.id,
        fund_name: 'Sadaqah',
        compliance_type: 'SADAQAH',
        description: 'Voluntary Charity',
      },
      {
        tenant_id: newTenant.id,
        fund_name: 'General Fund',
        compliance_type: 'GENERAL',
        description: 'General Mosque Maintenance',
      },
    ];

    await db.insert(fundCategories).values(defaultCategories);

    return c.json({ success: true, data: newTenant }, 201);
  } catch (error) {
    const e = error as { code?: string };
    if (e.code === '23505') {
      return c.json({ success: false, error: 'Tenant with this slug already exists' }, 409);
    }
    throw error;
  }
});

export default tenantsRoute;
