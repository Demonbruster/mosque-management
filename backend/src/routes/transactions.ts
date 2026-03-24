// ============================================
// Transactions API Routes
// ============================================

import { Hono } from "hono";
import { eq, sql, and } from "drizzle-orm";
import type { Env } from "../db/client";
import { createDb } from "../db/client";
import { transactions, fundCategories } from "../db/schema";
import { firebaseAuth, requireRole } from "../middleware/firebase-auth";

const transactionsRoute = new Hono<{ Bindings: Env }>();

// ---- Public endpoint (no auth) for dashboard ----

transactionsRoute.get("/summary", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.req.query("tenant_id");

  if (!tenantId) {
    return c.json({ success: false, error: "tenant_id is required" }, 400);
  }

  // Join with fund_categories to group by fund name
  const result = await db
    .select({
      fund_name: fundCategories.fund_name,
      compliance_type: fundCategories.compliance_type,
      total_amount: sql<string>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
      transaction_count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .innerJoin(fundCategories, eq(transactions.fund_id, fundCategories.id))
    .where(
      and(
        eq(transactions.tenant_id, tenantId),
        eq(transactions.status, "Approved")
      )
    )
    .groupBy(fundCategories.fund_name, fundCategories.compliance_type);

  return c.json({ success: true, data: result });
});

// ---- Protected routes ----

transactionsRoute.use("/*", firebaseAuth());

// GET /api/transactions — List transactions for the tenant
transactionsRoute.get("/", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const user = c.get("user");

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.tenant_id, user.tenant_id!))
    .orderBy(sql`${transactions.transaction_date} DESC`);

  return c.json({ success: true, data: result });
});

// POST /api/transactions — Create a transaction (Pending by default)
transactionsRoute.post("/", requireRole("admin", "imam", "treasurer"), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const user = c.get("user");

  const result = await db
    .insert(transactions)
    .values({
      ...body,
      tenant_id: user.tenant_id,
      admin_id: user.uid,
      status: "Pending",
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// PATCH /api/transactions/:id/approve — Approve a transaction
transactionsRoute.patch("/:id/approve", requireRole("admin", "imam"), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");

  const result = await db
    .update(transactions)
    .set({
      status: "Approved",
      updated_at: new Date(),
    })
    .where(eq(transactions.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: "Transaction not found" }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// PATCH /api/transactions/:id/reject — Reject a transaction
transactionsRoute.patch("/:id/reject", requireRole("admin", "imam"), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param("id");

  const result = await db
    .update(transactions)
    .set({
      status: "Rejected",
      updated_at: new Date(),
    })
    .where(eq(transactions.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: "Transaction not found" }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

export default transactionsRoute;
