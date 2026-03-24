// ============================================
// Health Check Route
// ============================================

import { Hono } from "hono";
import type { Env } from "../db/client";

const health = new Hono<{ Bindings: Env }>();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "mms-backend",
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || "development",
  });
});

export default health;
