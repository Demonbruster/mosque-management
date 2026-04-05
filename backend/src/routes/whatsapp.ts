// ============================================
// Twilio WhatsApp Webhook Routes
// ============================================
// Handles incoming WhatsApp messages from Twilio.
// GET  — Webhook verification
// POST — Incoming message processing
// ============================================

import { Hono } from 'hono';
import { eq, ilike } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { communicationLogs, persons, messageTemplates } from '../db/schema';
import { sendWhatsAppMessage } from '../lib/twilio';
import { FlowEngine } from '../lib/flow-engine';

const whatsappRoute = new Hono<{ Bindings: Env }>();

/**
 * GET /api/whatsapp/webhook
 * Twilio webhook verification (if using custom verification).
 */
whatsappRoute.get('/webhook', (c) => {
  return c.json({
    status: 'ok',
    message: 'WhatsApp webhook is active',
  });
});

/**
 * POST /api/whatsapp/webhook
 * Receives incoming WhatsApp messages from Twilio.
 * Process and respond to messages here.
 */
whatsappRoute.post('/webhook', async (c) => {
  try {
    const body = await c.req.parseBody();
    const db = createDb(c.env.DATABASE_URL);

    // Differentiate between StatusCallback and Incoming Message
    const messageStatus = body['MessageStatus'] as string | undefined;
    const messageSid = body['MessageSid'] as string;

    if (messageStatus) {
      // 1. Delivery Status Callback
      console.log(`[WHATSAPP] Delivery callback: ${messageSid} is now ${messageStatus}`);

      // Map Twilio status to our enum
      let status: 'Sent' | 'Delivered' | 'Read' | 'Failed' | undefined = undefined;
      if (messageStatus === 'sent') status = 'Sent';
      if (messageStatus === 'delivered') status = 'Delivered';
      if (messageStatus === 'read') status = 'Read';
      if (messageStatus === 'failed' || messageStatus === 'undelivered') status = 'Failed';

      if (status) {
        await db
          .update(communicationLogs)
          .set({
            delivery_status: status,
            ...(status === 'Delivered' ? { delivered_at: new Date() } : {}),
            ...(status === 'Read' ? { read_at: new Date() } : {}),
          })
          .where(eq(communicationLogs.external_message_id, messageSid));
      }
      return c.text('OK', 200);
    }

    // 1.5 Template Status Callback (Twilio Content API)
    const contentSid = body['ContentSid'] as string | undefined;
    const templateStatus = body['Status'] as string | undefined;

    if (contentSid && templateStatus) {
      console.log(`[WHATSAPP] Template status update: ${contentSid} is now ${templateStatus}`);

      let status: 'Submitted' | 'Approved' | 'Rejected' | undefined = undefined;
      if (templateStatus === 'approved') status = 'Approved';
      if (templateStatus === 'rejected') status = 'Rejected';
      if (templateStatus === 'pending') status = 'Submitted';

      if (status) {
        await db
          .update(messageTemplates)
          .set({
            approval_status: status,
            rejection_reason: (body['RejectionReason'] as string) || null,
            updated_at: new Date(),
          })
          .where(eq(messageTemplates.meta_template_id, contentSid));
      }
      return c.text('OK', 200);
    }

    // 2. Incoming Message
    const from = body['From'] as string;
    const messageBody = body['Body'] as string;
    console.log(`[WHATSAPP] Incoming message from ${from}: ${messageBody}`);

    // Try to find the person by phone number to link the incoming log
    // We'll just do a basic log insert for now, keeping person_id null if there's no match.
    // Wait, person_id is NOT NULL in Drizzle schema `uuid('person_id').notNull().references()`.
    // So we must find a person.
    const personsList = await db
      .select()
      .from(persons)
      .where(ilike(persons.phone_number, `%${from.replace('whatsapp:', '').replace('+', '')}%`))
      .limit(1);

    if (personsList.length > 0) {
      const p = personsList[0];
      await db.insert(communicationLogs).values({
        tenant_id: p.tenant_id,
        person_id: p.id,
        channel: 'whatsapp',
        message_body: `[INBOUND] ${messageBody}`,
        delivery_status: 'Delivered', // conceptually it's received
        external_message_id: messageSid,
      });
    }

    // 3. Process via Flow Engine — TASK-020
    const flowEngine = new FlowEngine(db, {
      accountSid: c.env.TWILIO_ACCOUNT_SID,
      authToken: c.env.TWILIO_AUTH_TOKEN,
      whatsappNumber: c.env.TWILIO_WHATSAPP_NUMBER,
      tenantId: personsList[0]?.tenant_id || '', // Fallback to empty if no person, but startFlow/processIncoming handles this
    });

    const isHandled = await flowEngine.processIncoming(personsList[0]?.id || '', messageBody);

    if (isHandled) {
      console.log(`[WHATSAPP] Message handled by flow engine for person ${personsList[0]?.id}`);
      return c.text('OK', 200);
    }

    // Fallback: Send an auto-reply acknowledgement using the Queue (so we don't block)
    // Here we'd ideally trigger sendWhatsAppMessage, we can just do it synchronously for simple replies.
    await sendWhatsAppMessage(
      {
        accountSid: c.env.TWILIO_ACCOUNT_SID,
        authToken: c.env.TWILIO_AUTH_TOKEN,
        whatsappNumber: c.env.TWILIO_WHATSAPP_NUMBER,
      },
      from.replace('whatsapp:', ''),
      'Assalamu Alaikum! Your message has been received. We will get back to you shortly. — Mosque Management System',
    );

    // Twilio expects a 200 response
    return c.text('OK', 200);
  } catch (error) {
    console.error('[WHATSAPP] Webhook error:', error);
    return c.text('OK', 200); // Always return 200 to Twilio
  }
});

export default whatsappRoute;
