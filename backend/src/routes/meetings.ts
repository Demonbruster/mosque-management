import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { meetingLogs } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const meetingsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/meetings
meetingsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const typeFilter = c.req.query('type');

  const conditions = [eq(meetingLogs.tenant_id, tenantId)];
  if (typeFilter) {
    conditions.push(
      eq(meetingLogs.meeting_type, typeFilter as 'Jamath' | 'Management' | 'Panchayath'),
    );
  }

  const meetings = await db
    .select()
    .from(meetingLogs)
    .where(and(...conditions))
    .orderBy(desc(meetingLogs.meeting_date));
  return c.json({ success: true, data: meetings });
});

// POST /api/meetings
meetingsRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const result = await db.transaction(async (tx) => {
    // 1. Auto-lock previous meetings of same type
    await tx
      .update(meetingLogs)
      .set({ is_locked: true })
      .where(
        and(eq(meetingLogs.tenant_id, tenantId), eq(meetingLogs.meeting_type, body.meeting_type)),
      );

    // 2. Insert new meeting
    const [newMeeting] = await tx
      .insert(meetingLogs)
      .values({
        tenant_id: tenantId,
        meeting_type: body.meeting_type,
        meeting_date: body.meeting_date,
        title: body.title,
        minutes_text: body.minutes_text,
        attendees_count: body.attendees_count,
        is_locked: false,
      })
      .returning();

    return newMeeting;
  });

  return c.json({ success: true, data: result }, 201);
});

// GET /api/meetings/:id
meetingsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  const [meeting] = await db
    .select()
    .from(meetingLogs)
    .where(and(eq(meetingLogs.tenant_id, tenantId), eq(meetingLogs.id, id)));

  if (!meeting) return c.json({ success: false, error: 'Meeting not found' }, 404);
  return c.json({ success: true, data: meeting });
});

// PUT /api/meetings/:id
meetingsRoute.put('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const body = await c.req.json();

  // Check if meeting locked
  const [existing] = await db
    .select()
    .from(meetingLogs)
    .where(and(eq(meetingLogs.tenant_id, tenantId), eq(meetingLogs.id, id)));

  if (!existing) return c.json({ success: false, error: 'Meeting not found' }, 404);
  if (existing.is_locked) {
    return c.json({ success: false, error: 'Meeting minutes are locked' }, 403);
  }

  const [updatedMeeting] = await db
    .update(meetingLogs)
    .set({
      meeting_type: body.meeting_type,
      meeting_date: body.meeting_date,
      title: body.title,
      minutes_text: body.minutes_text,
      attendees_count: body.attendees_count,
    })
    .where(and(eq(meetingLogs.tenant_id, tenantId), eq(meetingLogs.id, id)))
    .returning();

  return c.json({ success: true, data: updatedMeeting });
});

export default meetingsRoute;
