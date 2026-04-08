// ============================================
// Households API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, ilike, or } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { households, personHouseholdLinks, persons } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const householdsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/households — List households for the tenant
householdsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db.select().from(households).where(eq(households.tenant_id, tenantId));

  return c.json({ success: true, data: result });
});

// GET /api/households/search — Search households
householdsRoute.get('/search', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const q = c.req.query('q') || '';

  if (!q || q.length < 2) {
    return c.json({ success: true, data: [] });
  }

  const searchTerm = `%${q}%`;

  const result = await db
    .select()
    .from(households)
    .where(
      and(
        eq(households.tenant_id, tenantId),
        or(
          ilike(households.address_line_1, searchTerm),
          ilike(households.mahalla_zone, searchTerm),
        ),
      ),
    )
    .limit(20);

  return c.json({ success: true, data: result });
});

// GET /api/households/:id/members — Get members of a household
householdsRoute.get('/:id/members', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const household = await db
    .select({ id: households.id })
    .from(households)
    .where(and(eq(households.id, id), eq(households.tenant_id, tenantId)));

  if (household.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

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

  return c.json({ success: true, data: members });
});

// GET /api/households/:id — Get household with members
householdsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const household = await db
    .select()
    .from(households)
    .where(and(eq(households.id, id), eq(households.tenant_id, tenantId)));

  if (household.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

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

  return c.json({ success: true, data: { ...household[0], members } });
});

// POST /api/households — Create a household (admin/imam only)
householdsRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  if (body.address_line_1) {
    const existing = await db
      .select()
      .from(households)
      .where(
        and(eq(households.tenant_id, tenantId), eq(households.address_line_1, body.address_line_1)),
      );

    if (existing.length > 0) {
      return c.json(
        {
          success: false,
          error: 'A household with this address already exists. Please use a unique address.',
        },
        400,
      );
    }
  }

  const result = await db
    .insert(households)
    .values({ ...body, tenant_id: tenantId })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// PUT /api/households/:id — Update a household (admin/imam only)
householdsRoute.put('/:id', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  if (body.address_line_1) {
    const existing = await db
      .select()
      .from(households)
      .where(
        and(eq(households.tenant_id, tenantId), eq(households.address_line_1, body.address_line_1)),
      );

    if (existing.length > 0 && existing[0].id !== id) {
      return c.json(
        {
          success: false,
          error: 'Another household with this address already exists. Please use a unique address.',
        },
        400,
      );
    }
  }

  const result = await db
    .update(households)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(households.id, id), eq(households.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// DELETE /api/households/:id — Delete a household
householdsRoute.delete('/:id', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;
  const tenantId = c.get('tenantId');

  // Check if active members exist
  const activeMembers = await db
    .select()
    .from(personHouseholdLinks)
    .where(
      and(eq(personHouseholdLinks.household_id, id), eq(personHouseholdLinks.is_active, true)),
    );

  if (activeMembers.length > 0) {
    return c.json(
      {
        success: false,
        error: 'Cannot delete household. Please remove active members from this household first.',
      },
      400,
    );
  }

  const result = await db
    .delete(households)
    .where(and(eq(households.id, id), eq(households.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Household not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

export default householdsRoute;
