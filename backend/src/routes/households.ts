// ============================================
// Households API Routes
// ============================================

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { households, personHouseholdLinks } from '../db/schema';
import { firebaseAuth, requireRole } from '../middleware/firebase-auth';

const householdsRoute = new Hono<{
  Bindings: Env;
  Variables: { user: import('../middleware/firebase-auth').AuthUser };
}>();

householdsRoute.use('/*', firebaseAuth());

// GET /api/households — List households for the tenant
householdsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');

  const result = await db
    .select()
    .from(households)
    .where(eq(households.tenant_id, user.tenant_id!));

  return c.json({ success: true, data: result });
});

// GET /api/households/:id — Get household with members
householdsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');

  const household = await db.select().from(households).where(eq(households.id, id));

  if (household.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

  // Fetch active members linked to this household
  const members = await db
    .select()
    .from(personHouseholdLinks)
    .where(eq(personHouseholdLinks.household_id, id));

  return c.json({
    success: true,
    data: { ...household[0], members },
  });
});

// POST /api/households — Create a household (admin/imam only)
householdsRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const user = c.get('user');

  const result = await db
    .insert(households)
    .values({ ...body, tenant_id: user.tenant_id })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

export default householdsRoute;
