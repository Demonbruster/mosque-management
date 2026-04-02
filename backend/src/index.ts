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
} from './routes';

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

// ---- Root ----

app.get('/', (c) => {
  return c.json({
    name: 'Mosque Management System API',
    version: '0.1.0',
    docs: '/api/health',
  });
});

export default app;
