// ============================================
// CORS Middleware
// ============================================

import { cors } from 'hono/cors';
import { eq, or } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { tenants } from '../db/schema';

export function corsMiddleware(env?: Env) {
  return cors({
    origin: async (origin, c) => {
      // 1. Allow Localhost
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return origin;
      }

      // 2. Allow hardcoded CORS_ORIGIN if provided (admin/default frontend)
      if (env?.CORS_ORIGIN && origin === env.CORS_ORIGIN) {
        return origin;
      }

      try {
        // 3. Extract hostname for DB lookup
        const url = new URL(origin);
        const hostname = url.hostname;

        // 4. Check DB for matching domain OR slug-based subdomain
        // We'll trust all subdomains that match a tenant's slug for now
        // or a specific custom domain.
        const db = createDb(env?.DATABASE_URL || '');
        const result = await db
          .select({ id: tenants.id })
          .from(tenants)
          .where(
            or(
              eq(tenants.domain, hostname),
              // Support slug.base-domain.com (if hostname starts with slug followed by our expected structure)
              // Since we don't have a BASE_DOMAIN yet, we'll check if the hostname matches the slug exactly
              // or if we can extract it.
              eq(tenants.slug, hostname.split('.')[0]),
            ),
          )
          .limit(1);

        if (result.length > 0) {
          return origin;
        }
      } catch (err) {
        console.error('[CORS] Error validating origin:', err);
      }

      // 5. Default: Reject
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  });
}
