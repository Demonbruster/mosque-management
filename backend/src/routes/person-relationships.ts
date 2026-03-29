// ============================================
// Person Relationships API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, or } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { personRelationships, persons } from '../db/schema';
import { firebaseAuth, requireRole } from '../middleware/firebase-auth';

const personRelationshipsRoute = new Hono<{
  Bindings: Env;
  Variables: { user: import('../middleware/firebase-auth').AuthUser };
}>();

personRelationshipsRoute.use('/*', firebaseAuth());

// POST /api/person-relationships — Create family relationship link
personRelationshipsRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const user = c.get('user');

  // Basic validation
  if (!body.person_id_a || !body.person_id_b || !body.relationship_code) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }

  // Ensure persons belong to the tenant
  const personA = await db
    .select()
    .from(persons)
    .where(and(eq(persons.id, body.person_id_a), eq(persons.tenant_id, user.tenant_id!)));
  const personB = await db
    .select()
    .from(persons)
    .where(and(eq(persons.id, body.person_id_b), eq(persons.tenant_id, user.tenant_id!)));

  if (personA.length === 0 || personB.length === 0) {
    return c.json({ success: false, error: 'Persons not found or access denied' }, 404);
  }

  const result = await db
    .insert(personRelationships)
    .values({
      person_id_a: body.person_id_a,
      person_id_b: body.person_id_b,
      relationship_code: body.relationship_code,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// GET /api/person-relationships/:personId — Get relationships for a person
personRelationshipsRoute.get('/:personId', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const personId = c.req.param('personId') as string;
  const user = c.get('user');

  const person = await db
    .select()
    .from(persons)
    .where(and(eq(persons.id, personId), eq(persons.tenant_id, user.tenant_id!)));

  if (person.length === 0) {
    return c.json({ success: false, error: 'Person not found' }, 404);
  }

  const result = await db
    .select()
    .from(personRelationships)
    .where(
      or(
        eq(personRelationships.person_id_a, personId),
        eq(personRelationships.person_id_b, personId),
      ),
    );

  return c.json({ success: true, data: result });
});

// DELETE /api/person-relationships/:id
personRelationshipsRoute.delete('/:id', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;

  const result = await db
    .delete(personRelationships)
    .where(eq(personRelationships.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Relationship not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

export default personRelationshipsRoute;
