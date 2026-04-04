import { Hono } from 'hono';
import { eq, and, sql, inArray } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { personTags } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const personTagsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/person-tags — List distinct tags for a tenant
personTagsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .selectDistinct({ name: personTags.tag_name })
    .from(personTags)
    .where(eq(personTags.tenant_id, tenantId));

  return c.json({ success: true, data: result.map((t) => t.name) });
});

// GET /api/person-tags/:personId/tags — Get tags for a specific person
personTagsRoute.get('/:personId/tags', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const personId = c.req.param('personId');

  const result = await db
    .select({ name: personTags.tag_name })
    .from(personTags)
    .where(and(eq(personTags.tenant_id, tenantId), eq(personTags.person_id, personId)));

  return c.json({ success: true, data: result.map((t) => t.name) });
});

// POST /api/person-tags/bulk-add — Add a tag to multiple persons
personTagsRoute.post('/bulk-add', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json<{ personIds: string[]; tag: string }>();

  if (!body.personIds || body.personIds.length === 0 || !body.tag) {
    return c.json({ success: false, error: 'Invalid payload' }, 400);
  }

  // To prevent duplicates, we can use standard insert. We may need to do onConflictDoNothing but since we don't have unique constraint, we'll just query existing and filter
  const existing = await db
    .select({ person_id: personTags.person_id })
    .from(personTags)
    .where(
      and(
        eq(personTags.tenant_id, tenantId),
        eq(personTags.tag_name, body.tag),
        inArray(personTags.person_id, body.personIds),
      ),
    );

  const existingIds = new Set(existing.map((e) => e.person_id));
  const newPersonIds = body.personIds.filter((id) => !existingIds.has(id));

  if (newPersonIds.length > 0) {
    const values = newPersonIds.map((personId) => ({
      tenant_id: tenantId,
      person_id: personId,
      tag_name: body.tag,
    }));
    await db.insert(personTags).values(values);
  }

  return c.json({ success: true, addedCount: newPersonIds.length }, 201);
});

// DELETE /api/person-tags/bulk-remove — Remove a tag from multiple persons
personTagsRoute.delete('/bulk-remove', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json<{ personIds: string[]; tag: string }>();

  if (!body.personIds || body.personIds.length === 0 || !body.tag) {
    return c.json({ success: false, error: 'Invalid payload' }, 400);
  }

  const result = await db
    .delete(personTags)
    .where(
      and(
        eq(personTags.tenant_id, tenantId),
        eq(personTags.tag_name, body.tag),
        inArray(personTags.person_id, body.personIds),
      ),
    )
    .returning({ id: personTags.id });

  return c.json({ success: true, removedCount: result.length }, 200);
});

export default personTagsRoute;
