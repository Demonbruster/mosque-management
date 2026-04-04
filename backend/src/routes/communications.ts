// ============================================
// Communications Routes
// ============================================
// Internal API for listing WhatsApp/SMS logs
// and broadcasting messages queueing.
// ============================================

import { Hono } from 'hono';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { createDb } from '../db/client';
import type { Env } from '../db/client';
import type { AuthUser } from '../middleware/firebase-auth';
import { communicationLogs, persons } from '../db/schema';
import type { WhatsAppQueuePayload } from '../lib/twilio';

type Variables = {
  user: AuthUser;
  tenantId: string;
};

const communicationsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---- Validation Schemas ----
// Not using Zod to avoid extra dependencies, relying on implicit types or manual validation

/**
 * GET /api/communications/logs
 * List all communication logs.
 */
communicationsRoute.get('/logs', async (c) => {
  const tenantId = c.get('tenantId');
  const db = createDb(c.env.DATABASE_URL);

  const limit = parseInt(c.req.query('limit') || '50', 10);
  const status = c.req.query('status') as any; // Sent, Delivered, Read, Failed

  const conditions = [eq(communicationLogs.tenant_id, tenantId)];
  if (status) {
    conditions.push(eq(communicationLogs.delivery_status, status));
  }

  const logs = await db
    .select({
      id: communicationLogs.id,
      channel: communicationLogs.channel,
      message_body: communicationLogs.message_body,
      delivery_status: communicationLogs.delivery_status,
      sent_at: communicationLogs.sent_at,
      delivered_at: communicationLogs.delivered_at,
      read_at: communicationLogs.read_at,
      person: {
        id: persons.id,
        first_name: persons.first_name,
        last_name: persons.last_name,
        phone_number: persons.phone_number,
      },
    })
    .from(communicationLogs)
    .leftJoin(persons, eq(communicationLogs.person_id, persons.id))
    .where(and(...conditions))
    .orderBy(desc(communicationLogs.sent_at))
    .limit(limit);

  return c.json({ success: true, data: logs });
});

/**
 * POST /api/communications/broadcast
 * Adds a bulk message broadcast request to the queue.
 */
communicationsRoute.post('/broadcast', async (c) => {
  const data = await c.req.json();
  const tenantId = c.get('tenantId');
  const db = createDb(c.env.DATABASE_URL);

  // 1. Fetch phone numbers for target persons
  const targetPersons = await db
    .select({
      id: persons.id,
      phone_number: persons.phone_number,
      whatsapp_opt_in: persons.whatsapp_opt_in,
    })
    .from(persons)
    .where(and(eq(persons.tenant_id, tenantId), inArray(persons.id, data.personIds)));

  const queuedLogs = [];

  // 2. Filter contacts with valid numbers & opted-in (if required per your policy, assuming default opt-in or valid phone)
  for (const person of targetPersons) {
    if (!person.phone_number) continue;

    // 3. Insert into communication_logs as 'Sent' (initial state before queue picks it up)
    const [log] = await db
      .insert(communicationLogs)
      .values({
        tenant_id: tenantId,
        person_id: person.id,
        channel: 'whatsapp',
        message_body: data.messageBody,
        delivery_status: 'Sent',
      })
      .returning();

    // 4. Send to Queue
    const queuePayload: WhatsAppQueuePayload = {
      logId: log.id,
      tenantId: tenantId,
      to: person.phone_number,
      body: data.messageBody,
      retryCount: 0,
    };

    // Push message to Cloudflare Queue
    await c.env.WHATSAPP_QUEUE.send(queuePayload);
    queuedLogs.push(log.id);
  }

  return c.json({
    success: true,
    message: `Broadcast queued to ${queuedLogs.length} contacts`,
    queuedCount: queuedLogs.length,
  });
});

export default communicationsRoute;
