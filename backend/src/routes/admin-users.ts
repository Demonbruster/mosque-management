// ============================================
// Admin Users API Routes
// ============================================
// NOTE: Firebase Admin SDK (user creation, role assignment, listing)
// CANNOT run on Cloudflare Workers — it requires Node.js, gRPC, and
// filesystem access unavailable in the Workers V8 isolate runtime.
//
// These operations must be performed via:
//   scripts/set-user-claims.ts  — Node.js CLI (local/CI use)
//   OR a dedicated Cloud Function / Node.js server
//
// This router handles the read portion (listing users scoped to a
// tenant) via Firestore/Admin from an out-of-band service, or via
// a Cloudflare Worker calling a trusted internal Node.js endpoint.
//
// TODO: Connect to a Firebase Admin proxy service for production use.
// ============================================

import { Hono } from 'hono';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';
import type { Env } from '../db/client';

type Variables = { user: AuthUser; tenantId: string };

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// All admin routes strictly require "admin" role
router.use('*', requireRole('admin'));

/**
 * POST /api/admin/users/invite
 *
 * Firebase Admin SDK user creation cannot run on Cloudflare Workers.
 * To invite users, use the Node.js CLI script:
 *
 *   bun run scripts/invite-user.ts --email=... --role=... --tenant=...
 *
 * This endpoint returns a clear explanation instead of silently failing.
 */
router.post('/invite', async (c) => {
  return c.json(
    {
      success: false,
      error: 'User invitation must be performed via the admin CLI script.',
      help: 'Run: bun run scripts/invite-user.ts --email=<email> --role=<role> --tenant=<tenant_id>',
    },
    503,
  );
});

/**
 * GET /api/admin/users
 *
 * Firebase Admin listUsers() cannot run on Cloudflare Workers.
 * User listing should be served from a trusted Node.js proxy or stored
 * in the Neon database (sync custom claims on login via a Cloud Function).
 */
router.get('/', async (c) => {
  return c.json(
    {
      success: false,
      error: 'User listing via Firebase Admin is unavailable on Cloudflare Workers.',
      help: 'Use the admin CLI: bun run scripts/list-users.ts --tenant=<tenant_id>',
    },
    503,
  );
});

/**
 * PATCH /api/admin/users/:uid/role
 *
 * Firebase Admin setCustomUserClaims() cannot run on Cloudflare Workers.
 * Use the CLI script to update roles.
 */
router.patch('/:uid/role', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Role updates via Firebase Admin are unavailable on Cloudflare Workers.',
      help: 'Use the admin CLI: bun run scripts/set-user-claims.ts --uid=<uid> --role=<role>',
    },
    503,
  );
});

export { router as adminUsersRoutes };
