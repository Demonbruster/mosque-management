// ============================================
// Households API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { households, personHouseholdLinks, persons } from '../db/schema';
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

// GET /api/households/:id/members — Get members of a household
householdsRoute.get('/:id/members', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const user = c.get('user');

  const household = await db
    .select({ id: households.id })
    .from(households)
    .where(and(eq(households.id, id), eq(households.tenant_id, user.tenant_id!)));

  if (household.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

  // Fetch active members linked to this household joining persons
  const members = await db
    .select({
      link_id: personHouseholdLinks.id,
      household_role: personHouseholdLinks.household_role,
      start_date: personHouseholdLinks.start_date,
      person_id: persons.id,
      first_name: persons.first_name,
      last_name: persons.last_name,
      category: persons.category,
      gender: persons.gender,
      phone_number: persons.phone_number,
    })
    .from(personHouseholdLinks)
    .innerJoin(persons, eq(personHouseholdLinks.person_id, persons.id))
    .where(
      and(eq(personHouseholdLinks.household_id, id), eq(personHouseholdLinks.is_active, true)),
    );

  return c.json({
    success: true,
    data: members,
  });
});

// GET /api/households/:id — Get household with members
householdsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');

  const user = c.get('user');

  const household = await db
    .select()
    .from(households)
    .where(and(eq(households.id, id), eq(households.tenant_id, user.tenant_id!)));

  if (household.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

  // Fetch active members linked to this household
  const members = await db
    .select({
      link_id: personHouseholdLinks.id,
      household_role: personHouseholdLinks.household_role,
      start_date: personHouseholdLinks.start_date,
      person: {
        id: persons.id,
        first_name: persons.first_name,
        last_name: persons.last_name,
        category: persons.category,
      },
    })
    .from(personHouseholdLinks)
    .innerJoin(persons, eq(personHouseholdLinks.person_id, persons.id))
    .where(
      and(eq(personHouseholdLinks.household_id, id), eq(personHouseholdLinks.is_active, true)),
    );

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
