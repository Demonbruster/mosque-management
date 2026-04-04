import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { panchayathCases, panchayathSessions, persons } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const panchayathRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/panchayath
panchayathRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const complainantAlias = alias(persons, 'complainant');
  const respondentAlias = alias(persons, 'respondent');

  const cases = await db
    .select({
      id: panchayathCases.id,
      tenant_id: panchayathCases.tenant_id,
      case_id: panchayathCases.case_id,
      complainant_id: panchayathCases.complainant_id,
      respondent_id: panchayathCases.respondent_id,
      subject: panchayathCases.subject,
      status: panchayathCases.status,
      resolution_notes: panchayathCases.resolution_notes,
      created_at: panchayathCases.created_at,
      updated_at: panchayathCases.updated_at,
      complainant: {
        first_name: complainantAlias.first_name,
        last_name: complainantAlias.last_name,
      },
      respondent: {
        first_name: respondentAlias.first_name,
        last_name: respondentAlias.last_name,
      },
    })
    .from(panchayathCases)
    .leftJoin(complainantAlias, eq(panchayathCases.complainant_id, complainantAlias.id))
    .leftJoin(respondentAlias, eq(panchayathCases.respondent_id, respondentAlias.id))
    .where(eq(panchayathCases.tenant_id, tenantId))
    .orderBy(desc(panchayathCases.created_at));

  return c.json({ success: true, data: cases });
});

// POST /api/panchayath
panchayathRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const [newCase] = await db
    .insert(panchayathCases)
    .values({
      tenant_id: tenantId,
      case_id: body.case_id,
      complainant_id: body.complainant_id,
      respondent_id: body.respondent_id || null,
      subject: body.subject,
      status: body.status || 'Open',
      resolution_notes: body.resolution_notes,
    })
    .returning();

  return c.json({ success: true, data: newCase }, 201);
});

// GET /api/panchayath/:id
panchayathRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  const complainantAlias = alias(persons, 'complainant');
  const respondentAlias = alias(persons, 'respondent');

  const [pCase] = await db
    .select({
      id: panchayathCases.id,
      tenant_id: panchayathCases.tenant_id,
      case_id: panchayathCases.case_id,
      complainant_id: panchayathCases.complainant_id,
      respondent_id: panchayathCases.respondent_id,
      subject: panchayathCases.subject,
      status: panchayathCases.status,
      resolution_notes: panchayathCases.resolution_notes,
      created_at: panchayathCases.created_at,
      updated_at: panchayathCases.updated_at,
      complainant: {
        first_name: complainantAlias.first_name,
        last_name: complainantAlias.last_name,
      },
      respondent: {
        first_name: respondentAlias.first_name,
        last_name: respondentAlias.last_name,
      },
    })
    .from(panchayathCases)
    .leftJoin(complainantAlias, eq(panchayathCases.complainant_id, complainantAlias.id))
    .leftJoin(respondentAlias, eq(panchayathCases.respondent_id, respondentAlias.id))
    .where(and(eq(panchayathCases.tenant_id, tenantId), eq(panchayathCases.id, id)));

  if (!pCase) return c.json({ success: false, error: 'Case not found' }, 404);

  const sessions = await db
    .select()
    .from(panchayathSessions)
    .where(and(eq(panchayathSessions.tenant_id, tenantId), eq(panchayathSessions.case_id, id)))
    .orderBy(desc(panchayathSessions.session_date));

  return c.json({ success: true, data: { ...pCase, sessions } });
});

// PUT /api/panchayath/:id
panchayathRoute.put('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const [pCase] = await db
    .update(panchayathCases)
    .set({
      complainant_id: body.complainant_id,
      respondent_id: body.respondent_id || null,
      subject: body.subject,
      status: body.status,
      resolution_notes: body.resolution_notes,
      // updated_at is handled by default setup or if needed we can set to now
    })
    .where(and(eq(panchayathCases.tenant_id, tenantId), eq(panchayathCases.id, id)))
    .returning();

  if (!pCase) return c.json({ success: false, error: 'Case not found' }, 404);
  return c.json({ success: true, data: pCase });
});

// POST /api/panchayath/:id/sessions
panchayathRoute.post('/:id/sessions', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const [pCase] = await db
    .select({ id: panchayathCases.id })
    .from(panchayathCases)
    .where(and(eq(panchayathCases.tenant_id, tenantId), eq(panchayathCases.id, id)));

  if (!pCase) return c.json({ success: false, error: 'Case not found' }, 404);

  const [newSession] = await db
    .insert(panchayathSessions)
    .values({
      tenant_id: tenantId,
      case_id: id,
      session_date: body.session_date,
      notes: body.notes,
      next_steps: body.next_steps,
    })
    .returning();

  return c.json({ success: true, data: newSession }, 201);
});

export default panchayathRoute;
