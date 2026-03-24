// ============================================
// Firebase Auth Middleware
// ============================================
// Verifies Firebase ID tokens on incoming requests.
// Extracts user UID and custom claims (roles) and
// attaches them to the Hono context.
//
// NOTE: Full Firebase Admin SDK is NOT available on
// Cloudflare Workers. This uses manual JWT verification
// against Google's public keys. For production, consider
// using a lightweight JWT library compatible with Workers.
// ============================================

import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export interface AuthUser {
  uid: string;
  email?: string;
  role?: string;
  tenant_id?: string;
}

/**
 * Firebase Auth middleware for Hono.
 * Verifies the Authorization: Bearer <token> header.
 *
 * In production, implement full JWT verification against
 * Google's JWKS endpoint:
 * https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
 */
export function firebaseAuth() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, {
        message: "Missing or invalid Authorization header",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      // TODO: Implement full JWT verification for production
      // For now, decode the token payload (base64) to extract claims.
      // This is a SCAFFOLD — replace with proper verification.
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

      const user: AuthUser = {
        uid: payload.user_id || payload.sub,
        email: payload.email,
        role: payload.role || payload.custom_claims?.role || "member",
        tenant_id: payload.tenant_id || payload.custom_claims?.tenant_id,
      };

      c.set("user", user);
      await next();
    } catch (error) {
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }
  };
}

/**
 * Role-Based Access Control middleware.
 * Must be used AFTER firebaseAuth().
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as AuthUser | undefined;

    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }

    if (!roles.includes(user.role || "")) {
      throw new HTTPException(403, {
        message: `Insufficient permissions. Required role: ${roles.join(" or ")}`,
      });
    }

    await next();
  };
}
