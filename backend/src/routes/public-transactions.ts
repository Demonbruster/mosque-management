// ============================================
// Public Transaction Summary Routes
// ============================================
// These endpoints are PUBLICLY accessible — no auth required.
// They serve the public financial transparency dashboard (ISAK-35).
//
// Routes:
//   GET /api/public/transactions/summary/monthly
//   GET /api/public/transactions/summary/trend
//
// Both accept `tenant_id` and filter on status = 'Approved' only.
// Compatible with Cloudflare Workers + Hono + Neon serverless.
// ============================================

import { Hono } from 'hono';
import { eq, sql, and } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { transactions, fundCategories } from '../db/schema';

const publicTransactionsRoute = new Hono<{ Bindings: Env }>();

// -------------------------------------------------------
// ST-11.1 — Monthly Income/Expense Breakdown by Fund
// GET /api/public/transactions/summary/monthly
//   ?tenant_id=<uuid>
//   &year=2026
//
// Returns: Array of { month, fund_name, compliance_type, type, total_amount, transaction_count }
// Filtered to: status = 'Approved', year = requested year
// -------------------------------------------------------
publicTransactionsRoute.get('/summary/monthly', async (c) => {
  const tenantId = c.req.query('tenant_id');
  const yearParam = c.req.query('year');

  if (!tenantId) {
    return c.json({ success: false, error: 'tenant_id is required' }, 400);
  }

  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) {
    return c.json({ success: false, error: 'Invalid year' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const result = await db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${transactions.transaction_date})::int`,
      fund_name: fundCategories.fund_name,
      compliance_type: fundCategories.compliance_type,
      type: transactions.type,
      total_amount: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)::text`,
      transaction_count: sql<number>`COUNT(*)::int`,
    })
    .from(transactions)
    .innerJoin(fundCategories, eq(transactions.fund_id, fundCategories.id))
    .where(
      and(
        eq(transactions.tenant_id, tenantId),
        eq(transactions.status, 'Approved'),
        sql`EXTRACT(YEAR FROM ${transactions.transaction_date}) = ${year}`,
      ),
    )
    .groupBy(
      sql`EXTRACT(MONTH FROM ${transactions.transaction_date})`,
      fundCategories.fund_name,
      fundCategories.compliance_type,
      transactions.type,
    )
    .orderBy(sql`EXTRACT(MONTH FROM ${transactions.transaction_date})`);

  // Metadata: last transaction updated_at for the "last updated" footer
  const [lastUpdated] = await db
    .select({ updated_at: transactions.updated_at })
    .from(transactions)
    .where(and(eq(transactions.tenant_id, tenantId), eq(transactions.status, 'Approved')))
    .orderBy(sql`${transactions.updated_at} DESC`)
    .limit(1);

  return c.json({
    success: true,
    data: result,
    meta: {
      year,
      last_updated: lastUpdated?.updated_at ?? null,
    },
  });
});

// -------------------------------------------------------
// ST-11.2 — 12-Month Trend Data (Income vs Expense)
// GET /api/public/transactions/summary/trend
//   ?tenant_id=<uuid>
//   &months=12  (default 12, max 24)
//
// Returns: Array of { year, month, type, total_amount, transaction_count }
// Ordered chronologically, last N months from now.
// -------------------------------------------------------
publicTransactionsRoute.get('/summary/trend', async (c) => {
  const tenantId = c.req.query('tenant_id');
  const monthsParam = c.req.query('months');

  if (!tenantId) {
    return c.json({ success: false, error: 'tenant_id is required' }, 400);
  }

  const months = monthsParam ? Math.min(parseInt(monthsParam, 10), 24) : 12;

  if (isNaN(months) || months < 1) {
    return c.json({ success: false, error: 'Invalid months parameter' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const result = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${transactions.transaction_date})::int`,
      month: sql<number>`EXTRACT(MONTH FROM ${transactions.transaction_date})::int`,
      type: transactions.type,
      total_amount: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)::text`,
      transaction_count: sql<number>`COUNT(*)::int`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.tenant_id, tenantId),
        eq(transactions.status, 'Approved'),
        // Parameterised interval — Neon/PostgreSQL compatible
        sql`${transactions.transaction_date} >= NOW() - (${months} * INTERVAL '1 month')`,
      ),
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${transactions.transaction_date})`,
      sql`EXTRACT(MONTH FROM ${transactions.transaction_date})`,
      transactions.type,
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${transactions.transaction_date})`,
      sql`EXTRACT(MONTH FROM ${transactions.transaction_date})`,
    );

  return c.json({
    success: true,
    data: result,
    meta: { months },
  });
});

export default publicTransactionsRoute;
