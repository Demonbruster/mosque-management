// ============================================
// Persons API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, or, ilike, desc, count } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { persons, personHouseholdLinks, households, personCategoryEnum } from '../db/schema';
import { firebaseAuth, requireRole } from '../middleware/firebase-auth';

const personsRoute = new Hono<{
  Bindings: Env;
  Variables: { user: import('../middleware/firebase-auth').AuthUser };
}>();

// All person routes require authentication
personsRoute.use('/*', firebaseAuth());

// GET /api/persons/search?q=... — Search persons (full-text basic)
personsRoute.get('/search', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');
  const q = c.req.query('q') || '';

  if (!q) {
    return c.json({ success: true, data: [] });
  }

  const searchTerm = `%${q}%`;

  const result = await db
    .select()
    .from(persons)
    .where(
      and(
        eq(persons.tenant_id, user.tenant_id!),
        or(
          ilike(persons.first_name, searchTerm),
          ilike(persons.last_name, searchTerm),
          ilike(persons.email, searchTerm),
          ilike(persons.phone_number, searchTerm),
        ),
      ),
    )
    .limit(20);

  return c.json({ success: true, data: result });
});

// GET /api/persons — List all persons for the tenant with pagination and filters
personsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get('user');

  const category = c.req.query('category');
  const mahalla = c.req.query('mahalla');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const offset = (page - 1) * limit;

  // We start building the query conditions
  const conditions = [eq(persons.tenant_id, user.tenant_id!)];
  if (category) {
    // Cast category to any or explicitly check enum if needed, but eq should handle string if it's identical
    conditions.push(eq(persons.category, category as any));
  }

  const baseQuery = db.select().from(persons);

  // If mahalla filter is present, we must join with households
  let finalQuery: any;
  let countQuery: any;

  if (mahalla) {
    finalQuery = baseQuery
      .innerJoin(personHouseholdLinks, eq(persons.id, personHouseholdLinks.person_id))
      .innerJoin(households, eq(personHouseholdLinks.household_id, households.id))
      .where(
        and(
          ...conditions,
          eq(personHouseholdLinks.is_active, true),
          eq(households.mahalla_zone, mahalla),
        ),
      )
      .limit(limit)
      .offset(offset);

    // Need a separate count
    countQuery = db
      .select({ count: count() })
      .from(persons)
      .innerJoin(personHouseholdLinks, eq(persons.id, personHouseholdLinks.person_id))
      .innerJoin(households, eq(personHouseholdLinks.household_id, households.id))
      .where(
        and(
          ...conditions,
          eq(personHouseholdLinks.is_active, true),
          eq(households.mahalla_zone, mahalla),
        ),
      );
  } else {
    finalQuery = baseQuery
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    countQuery = db
      .select({ count: count() })
      .from(persons)
      .where(and(...conditions));
  }

  const [result, totalResult] = await Promise.all([finalQuery, countQuery]);
  const total = totalResult[0].count;

  return c.json({
    success: true,
    data: result.map((r: any) => r.persons || r), // Extract person if it's a joined row
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/persons/:id/household-history — History of household links
personsRoute.get('/:id/household-history', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const user = c.get('user');

  // Verify person exists for tenant
  const person = await db
    .select({ id: persons.id })
    .from(persons)
    .where(and(eq(persons.id, id), eq(persons.tenant_id, user.tenant_id!)));

  if (person.length === 0) {
    return c.json({ success: false, error: 'Person not found' }, 404);
  }

  // Get history
  const history = await db
    .select({
      link_id: personHouseholdLinks.id,
      household_id: personHouseholdLinks.household_id,
      role: personHouseholdLinks.household_role,
      start_date: personHouseholdLinks.start_date,
      end_date: personHouseholdLinks.end_date,
      is_active: personHouseholdLinks.is_active,
      address_line_1: households.address_line_1,
      address_line_2: households.address_line_2,
      mahalla_zone: households.mahalla_zone,
    })
    .from(personHouseholdLinks)
    .innerJoin(households, eq(personHouseholdLinks.household_id, households.id))
    .where(eq(personHouseholdLinks.person_id, id))
    .orderBy(desc(personHouseholdLinks.start_date));

  return c.json({ success: true, data: history });
});

// GET /api/persons/:id — Get a single person
personsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');

  const user = c.get('user');

  const result = await db
    .select()
    .from(persons)
    .where(and(eq(persons.id, id), eq(persons.tenant_id, user.tenant_id!)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Person not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// POST /api/persons — Create a new person (admin/imam only)
personsRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const user = c.get('user');

  const result = await db
    .insert(persons)
    .values({ ...body, tenant_id: user.tenant_id })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

export default personsRoute;
