// ============================================
// Persons API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, or, ilike, desc, count, inArray } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { persons, personHouseholdLinks, households, personTags } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const personsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/persons/search?q=... — Search persons (full-text basic)
personsRoute.get('/search', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
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
        eq(persons.tenant_id, tenantId),
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
  const tenantId = c.get('tenantId');

  const category = c.req.query('category');
  const mahalla = c.req.query('mahalla');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const offset = (page - 1) * limit;

  const conditions = [eq(persons.tenant_id, tenantId)];
  if (category) {
    conditions.push(eq(persons.category, category as any));
  }

  const baseQuery = db.select().from(persons);

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
    data: result.map((r: any) => r.persons || r),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/persons/segment — Dynamic segmentation
personsRoute.get('/segment', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const zones = c.req.queries('zones[]') || c.req.queries('zones') || [];
  const tags = c.req.queries('tags[]') || c.req.queries('tags') || [];
  const category = c.req.query('category');
  const whatsappOptIn = c.req.query('whatsapp_opt_in');

  const baseQuery = db
    .selectDistinct({
      id: persons.id,
      first_name: persons.first_name,
      last_name: persons.last_name,
      phone_number: persons.phone_number,
      category: persons.category,
      whatsapp_opt_in: persons.whatsapp_opt_in,
    })
    .from(persons);

  const conditions = [eq(persons.tenant_id, tenantId)];

  if (category) {
    conditions.push(eq(persons.category, category as any));
  }

  if (whatsappOptIn === 'true') {
    conditions.push(eq(persons.whatsapp_opt_in, true));
  } else if (whatsappOptIn === 'false') {
    conditions.push(eq(persons.whatsapp_opt_in, false));
  }

  let finalQuery: any = baseQuery;

  if (zones.length > 0) {
    finalQuery = finalQuery
      .innerJoin(personHouseholdLinks, eq(persons.id, personHouseholdLinks.person_id))
      .innerJoin(households, eq(personHouseholdLinks.household_id, households.id));
    conditions.push(eq(personHouseholdLinks.is_active, true));
    conditions.push(inArray(households.mahalla_zone, zones));
  }

  if (tags.length > 0) {
    finalQuery = finalQuery.innerJoin(personTags, eq(persons.id, personTags.person_id));
    conditions.push(inArray(personTags.tag_name, tags));
  }

  const result = await finalQuery.where(and(...conditions));

  return c.json({ success: true, count: result.length, data: result.slice(0, 10) }); // return top 10 sample + count
});

// GET /api/persons/:id/household-history — History of household links
personsRoute.get('/:id/household-history', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const person = await db
    .select({ id: persons.id })
    .from(persons)
    .where(and(eq(persons.id, id), eq(persons.tenant_id, tenantId)));

  if (person.length === 0) {
    return c.json({ success: false, error: 'Person not found' }, 404);
  }

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
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(persons)
    .where(and(eq(persons.id, id), eq(persons.tenant_id, tenantId)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Person not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// PUT /api/persons/:id — Update a person
personsRoute.put('/:id', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;
  const tenantId = c.get('tenantId') as string;
  const body = await c.req.json();

  const result = await db
    .update(persons)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(persons.id, id), eq(persons.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Person not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// POST /api/persons — Create a new person (admin/imam only)
personsRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const result = await db
    .insert(persons)
    .values({ ...body, tenant_id: tenantId })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

export default personsRoute;
