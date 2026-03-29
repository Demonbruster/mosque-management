import { Next, Context } from 'hono';
import { createDb, Env } from '../db/client';
import { systemAuditLogs } from '../db/schema';
import { AuthUser } from './firebase-auth';

/**
 * Audit Logging Middleware
 * Logs sensitive operations to the system_audit_logs table.
 */
export function logSystemAction(action: string, resource: string) {
  return async (c: Context<{ Bindings: Env; Variables: { user: AuthUser } }>, next: Next) => {
    await next();

    // After the request is processed, check if it was successful (2xx)
    const status = c.res.status;
    if (status >= 200 && status < 300) {
      try {
        const user = c.get('user');
        if (user && user.tenant_id) {
          const targetId = c.req.param('uid') || c.req.param('id') || undefined;
          const db = createDb(c.env.DATABASE_URL);

          await db.insert(systemAuditLogs).values({
            tenant_id: user.tenant_id,
            user_id: user.uid,
            action,
            resource,
            target_id: targetId,
            details: `Completed ${c.req.method} ${c.req.path}`,
          });
        }
      } catch (err) {
        console.error('Failed to write audit log', err);
      }
    }
  };
}
