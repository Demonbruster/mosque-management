// ============================================
// Public Tenant Resolution Routes
// ============================================
// These endpoints are PUBLICLY accessible — no auth required.
// They allow the frontend to find the correct tenant_id based on the hostname or slug.
// ============================================

import { Hono } from 'hono';
import { eq, or } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { tenants } from '../db/schema';

const publicTenantsRoute = new Hono<{ Bindings: Env }>();

// GET /api/public/tenants/resolve?hostname=...&slug=...
publicTenantsRoute.get('/resolve', async (c) => {
  const hostname = c.req.query('hostname');
  const slug = c.req.query('slug');

  if (!hostname && !slug) {
    return c.json({ success: false, error: 'hostname or slug is required' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const result = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      domain: tenants.domain,
    })
    .from(tenants)
    .where(
      or(
        hostname ? eq(tenants.domain, hostname) : undefined,
        slug ? eq(tenants.slug, slug) : undefined,
      ),
    )
    .limit(1);

  if (result.length === 0) {
    return c.json({ success: false, error: 'Tenant not found' }, 404);
  }

  return c.json({
    success: true,
    data: result[0],
  });
});

export default publicTenantsRoute;
