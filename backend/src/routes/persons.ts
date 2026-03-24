// ============================================
// Persons API Routes
// ============================================

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Env } from "../db/client";
import { createDb } from "../db/client";
import { persons } from "../db/schema";
import { firebaseAuth, requireRole } from "../middleware/firebase-auth";

const personsRoute = new Hono<{ Bindings: Env }>();

// All person routes require authentication
personsRoute.use("/*", firebaseAuth());

// GET /api/persons — List all persons for the tenant
personsRoute.get("/", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get("user");

  const result = await db
    .select()
    .from(persons)
    .where(eq(persons.tenant_id, user.tenant_id!));

  return c.json({ success: true, data: result });
});

// GET /api/persons/:id — Get a single person
personsRoute.get("/:id", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");

  const result = await db
    .select()
    .from(persons)
    .where(eq(persons.id, id));

  if (result.length === 0) {
    return c.json({ success: false, error: "Person not found" }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// POST /api/persons — Create a new person (admin/imam only)
personsRoute.post("/", requireRole("admin", "imam"), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const user = c.get("user");

  const result = await db
    .insert(persons)
    .values({ ...body, tenant_id: user.tenant_id })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

export default personsRoute;
