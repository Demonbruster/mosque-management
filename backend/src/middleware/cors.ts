// ============================================
// CORS Middleware
// ============================================

import { cors } from "hono/cors";
import type { Env } from "../db/client";

export function corsMiddleware(env: Env) {
  return cors({
    origin: env.CORS_ORIGIN || "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  });
}
