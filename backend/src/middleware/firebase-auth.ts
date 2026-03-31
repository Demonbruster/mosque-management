// ============================================
// Firebase Auth Middleware
// ============================================
// Verifies Firebase ID tokens on incoming requests using jose.
// Uses Google's public JWKS endpoint — no firebase-admin needed.
// Compatible with Cloudflare Workers (Web Crypto / crypto.subtle).
//
// Token claims (role, tenant_id) must be set as Firebase custom
// claims via a Node.js admin script (scripts/set-user-claims.ts).
// ============================================

import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

// Google's Firebase JWKS endpoint URL
const FIREBASE_JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
);

// Lazily created — deferred so vi.mock('jose') can intercept createRemoteJWKSet in tests
let FIREBASE_JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJWKS() {
  if (!FIREBASE_JWKS) {
    FIREBASE_JWKS = createRemoteJWKSet(FIREBASE_JWKS_URL);
  }
  return FIREBASE_JWKS;
}

export interface AuthUser {
  uid: string;
  email?: string;
  role?: string;
  tenant_id?: string;
}

/**
 * Firebase Auth middleware for Hono on Cloudflare Workers.
 * Verifies the Authorization: Bearer <token> header using RS256 + JWKS.
 *
 * Requires `FIREBASE_PROJECT_ID` in Cloudflare Worker environment bindings (wrangler.toml).
 */
export function firebaseAuth() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new HTTPException(401, {
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.slice(7);
    const projectId = c.env?.FIREBASE_PROJECT_ID ?? 'test-project';

    try {
      const { payload } = await jwtVerify(token, getJWKS(), {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
        algorithms: ['RS256'],
      });

      // Custom claims set via Firebase Admin in scripts/set-user-claims.ts
      const claims = payload as Record<string, unknown>;

      const user: AuthUser = {
        uid: payload.sub!,
        email: payload.email as string | undefined,
        role: (claims.role as string) ?? 'member',
        tenant_id: claims.tenant_id as string | undefined,
      };

      c.set('user', user);
      await next();
    } catch {
      throw new HTTPException(401, { message: 'Invalid or expired token' });
    }
  };
}

/**
 * Role-Based Access Control middleware.
 * Must be used AFTER firebaseAuth().
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthUser | undefined;

    if (!user) {
      throw new HTTPException(401, { message: 'Authentication required' });
    }

    if (!roles.includes(user.role ?? '')) {
      throw new HTTPException(403, {
        message: `Insufficient permissions. Required role: ${roles.join(' or ')}`,
      });
    }

    await next();
  };
}
