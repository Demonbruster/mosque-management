// ============================================
// Tenant Isolation Middleware
// ============================================
// Ensures every authenticated request is scoped
// to a valid tenant. Must be used AFTER firebaseAuth().
//
// Sets `tenantId` on the Hono context as the single
// canonical source of truth for all route handlers.
// ============================================

import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AuthUser } from './firebase-auth';

/**
 * Validates that the authenticated user has a tenant_id claim.
 * Rejects with 403 if not — prevents orphaned users from accessing any data.
 *
 * Usage:
 *   app.use('/api/*', firebaseAuth());
 *   app.use('/api/*', requireTenant());
 *
 * Then in routes:
 *   const tenantId = c.get('tenantId'); // always a guaranteed string
 */
export function requireTenant() {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthUser | undefined;

    if (!user?.tenant_id) {
      throw new HTTPException(403, {
        message: 'No tenant association. Contact your mosque admin.',
      });
    }

    c.set('tenantId', user.tenant_id);
    await next();
  };
}
