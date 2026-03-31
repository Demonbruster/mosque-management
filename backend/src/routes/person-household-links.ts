// ============================================
// Person Household Links API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { personHouseholdLinks, persons, households } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const personHouseholdLinksRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/person-household-links — Create a new link
personHouseholdLinksRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  if (!body.person_id || !body.household_id || !body.start_date || !body.household_role) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }

  // Ensure person and household belong to the same tenant
  const person = await db
    .select()
    .from(persons)
    .where(and(eq(persons.id, body.person_id), eq(persons.tenant_id, tenantId)));
  const household = await db
    .select()
    .from(households)
    .where(and(eq(households.id, body.household_id), eq(households.tenant_id, tenantId)));

  if (person.length === 0 || household.length === 0) {
    return c.json({ success: false, error: 'Person or Household not found or access denied' }, 404);
  }

  const result = await db
    .insert(personHouseholdLinks)
    .values({
      person_id: body.person_id,
      household_id: body.household_id,
      household_role: body.household_role,
      start_date: body.start_date,
      is_active: true,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// DELETE /api/person-household-links/:id — Unlink a person (soft delete with history)
personHouseholdLinksRoute.delete('/:id', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;
  const body = await c.req.json().catch(() => ({}));

  const endDate = body.end_date || new Date().toISOString().split('T')[0];

  const result = await db
    .update(personHouseholdLinks)
    .set({ is_active: false, end_date: endDate, updated_at: new Date() })
    .where(eq(personHouseholdLinks.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Link not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

export default personHouseholdLinksRoute;
