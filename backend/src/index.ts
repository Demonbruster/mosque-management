// ============================================
// MMS Backend — Hono Entry Point
// ============================================
// Main application for Cloudflare Workers.
// Mounts middleware (CORS, logging, error handling)
// and all API route modules.
// ============================================

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './db/client';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { firebaseAuth } from './middleware/firebase-auth';
import { requireTenant } from './middleware/tenant';
import type { AuthUser } from './middleware/firebase-auth';
import {
  healthRoutes,
  personsRoutes,
  householdsRoutes,
  transactionsRoutes,
  whatsappRoutes,
  tenantsRoutes,
  adminUsersRoutes,
  personHouseholdLinksRoutes,
  personRelationshipsRoutes,
  fundCategoriesRoutes,
  publicTransactionsRoutes,
  assetsRoutes,
  tenancyRoutes,
  utensilsRoutes,
  utensilRentalsRoutes,
  lifeEventsRoutes,
  meetingsRoutes,
  panchayathRoutes,
  communicationsRoutes,
  personTagsRoutes,
  templatesRoutes,
} from './routes';
import { eq } from 'drizzle-orm';
import { createDb } from './db/client';
import { communicationLogs } from './db/schema';
import { sendWhatsAppMessage } from './lib/twilio';
import type { WhatsAppQueuePayload } from './lib/twilio';

// ---- Typed Hono context ----

type Variables = {
  user: AuthUser;
  tenantId: string;
};

// ---- App ----

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---- Global Middleware ----

app.use('*', (c, next) => corsMiddleware(c.env)(c, next));
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

// ---- Error Handler ----

app.onError(errorHandler);

// ---- Not Found ----

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      path: c.req.path,
    },
    404,
  );
});

// ---- Public Routes (no auth required) ----
// These MUST be mounted before any app.use() auth guards to remain unauthenticated.
// Hono middleware matching is prefix-based; /api/public/* does NOT match /api/transactions/*.

app.route('/api/health', healthRoutes);
app.route('/api/whatsapp', whatsappRoutes); // Twilio inbound webhooks — no user auth
app.route('/api/public/transactions', publicTransactionsRoutes); // ISAK-35 public dashboard — no auth

// ---- Auth + Tenant scope for all protected routes ----

app.use('/api/persons/*', firebaseAuth(), requireTenant());
app.use('/api/households/*', firebaseAuth(), requireTenant());
app.use('/api/transactions/*', firebaseAuth(), requireTenant());
app.use('/api/tenants/*', firebaseAuth(), requireTenant());
app.use('/api/admin/*', firebaseAuth(), requireTenant());
app.use('/api/person-household-links/*', firebaseAuth(), requireTenant());
app.use('/api/person-relationships/*', firebaseAuth(), requireTenant());
app.use('/api/fund-categories/*', firebaseAuth(), requireTenant());
app.use('/api/assets/*', firebaseAuth(), requireTenant());
app.use('/api/tenancy-agreements/*', firebaseAuth(), requireTenant());
app.use('/api/utensils/*', firebaseAuth(), requireTenant());
app.use('/api/utensil-rentals/*', firebaseAuth(), requireTenant());
app.use('/api/life-events/*', firebaseAuth(), requireTenant());
app.use('/api/meetings/*', firebaseAuth(), requireTenant());
app.use('/api/panchayath/*', firebaseAuth(), requireTenant());
app.use('/api/communications/*', firebaseAuth(), requireTenant());
app.use('/api/templates/*', firebaseAuth(), requireTenant());
app.use('/api/person-tags/*', firebaseAuth(), requireTenant());

// ---- Protected Routes ----

app.route('/api/persons', personsRoutes);
app.route('/api/households', householdsRoutes);
app.route('/api/transactions', transactionsRoutes);
app.route('/api/tenants', tenantsRoutes);
app.route('/api/admin/users', adminUsersRoutes);
app.route('/api/person-household-links', personHouseholdLinksRoutes);
app.route('/api/person-relationships', personRelationshipsRoutes);
app.route('/api/fund-categories', fundCategoriesRoutes);
app.route('/api/assets', assetsRoutes);
app.route('/api/tenancy-agreements', tenancyRoutes);
app.route('/api/utensils', utensilsRoutes);
app.route('/api/utensil-rentals', utensilRentalsRoutes);
app.route('/api/life-events', lifeEventsRoutes);
app.route('/api/meetings', meetingsRoutes);
app.route('/api/panchayath', panchayathRoutes);
app.route('/api/communications', communicationsRoutes);
app.route('/api/templates', templatesRoutes);
app.route('/api/person-tags', personTagsRoutes);

// ---- Root ----

app.get('/', (c) => {
  return c.json({
    name: 'Mosque Management System API',
    version: '0.1.0',
    docs: '/api/health',
  });
});

export { app };

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<WhatsAppQueuePayload>, env: Env): Promise<void> {
    const db = createDb(env.DATABASE_URL);
    for (const msg of batch.messages) {
      const payload = msg.body;
      try {
        const response = await sendWhatsAppMessage(
          {
            accountSid: env.TWILIO_ACCOUNT_SID,
            authToken: env.TWILIO_AUTH_TOKEN,
            whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
          },
          payload.to,
          payload.body,
          payload.mediaUrl,
        );

        if (!response.ok) {
          const errorResp = await response.text();
          console.error(`[QUEUE] Failed to send WhatsApp to ${payload.to}: ${errorResp}`);
          if (payload.retryCount < 3) {
            payload.retryCount++;
            msg.retry();
          } else {
            await db
              .update(communicationLogs)
              .set({ delivery_status: 'Failed' })
              .where(eq(communicationLogs.id, payload.logId));
          }
        } else {
          // Update log to Delivered initially, and wait for async Webhooks for deeper statuses
          // Alternatively, let the webhook handle the status update, and just log success
          const data = (await response.json()) as any;
          await db
            .update(communicationLogs)
            .set({
              delivery_status: 'Sent',
              external_message_id: data.sid,
            })
            .where(eq(communicationLogs.id, payload.logId));
        }
      } catch (error) {
        console.error(`[QUEUE] Error sending message:`, error);
        if (payload.retryCount < 3) {
          payload.retryCount++;
          msg.retry();
        } else {
          await db
            .update(communicationLogs)
            .set({ delivery_status: 'Failed' })
            .where(eq(communicationLogs.id, payload.logId));
        }
      }
    }
  },
};
