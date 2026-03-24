// ============================================
// MMS Backend — Hono Entry Point
// ============================================
// Main application for Cloudflare Workers.
// Mounts middleware (CORS, logging, error handling)
// and all API route modules.
// ============================================

import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import type { Env } from "./db/client";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import {
  healthRoutes,
  personsRoutes,
  householdsRoutes,
  transactionsRoutes,
  whatsappRoutes,
} from "./routes";

// ---- App ----

const app = new Hono<{ Bindings: Env }>();

// ---- Global Middleware ----

app.use("*", (c, next) => corsMiddleware(c.env)(c, next));
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", secureHeaders());

// ---- Error Handler ----

app.onError(errorHandler);

// ---- Not Found ----

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not Found",
      path: c.req.path,
    },
    404
  );
});

// ---- Routes ----

app.route("/api/health", healthRoutes);
app.route("/api/persons", personsRoutes);
app.route("/api/households", householdsRoutes);
app.route("/api/transactions", transactionsRoutes);
app.route("/api/whatsapp", whatsappRoutes);

// ---- Root ----

app.get("/", (c) => {
  return c.json({
    name: "Mosque Management System API",
    version: "0.1.0",
    docs: "/api/health",
  });
});

export default app;
