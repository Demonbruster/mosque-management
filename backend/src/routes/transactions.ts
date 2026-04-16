// ============================================
// Transactions API Routes
// ============================================

import { Hono } from 'hono';
import { eq, sql, and } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { transactions, fundCategories, persons } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const transactionsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/transactions/summary — Dashboard summary
transactionsRoute.get('/summary', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      fund_name: fundCategories.fund_name,
      compliance_type: fundCategories.compliance_type,
      total_amount: sql<string>`SUM(CAST(${transactions.amount} AS DECIMAL))`,
      transaction_count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .innerJoin(fundCategories, eq(transactions.fund_id, fundCategories.id))
    .where(and(eq(transactions.tenant_id, tenantId), eq(transactions.status, 'Approved')))
    .groupBy(fundCategories.fund_name, fundCategories.compliance_type);

  return c.json({ success: true, data: result });
});

// GET /api/transactions/pending — List pending transactions for the checker queue
transactionsRoute.get('/pending', requireRole('admin', 'imam', 'treasurer'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      type: transactions.type,
      payment_method: transactions.payment_method,
      status: transactions.status,
      description: transactions.description,
      donor_name: transactions.donor_name,
      transaction_date: transactions.transaction_date,
      fund_name: fundCategories.fund_name,
      entered_by_name: sql<string>`COALESCE(${persons.first_name} || ' ' || ${persons.last_name}, 'Admin')`,
      admin_id: transactions.admin_id,
      project_id: transactions.project_id,
    })
    .from(transactions)
    .leftJoin(fundCategories, eq(transactions.fund_id, fundCategories.id))
    .leftJoin(persons, eq(transactions.admin_id, persons.id))
    .where(and(eq(transactions.tenant_id, tenantId), eq(transactions.status, 'Pending')))
    .orderBy(sql`${transactions.transaction_date} ASC`);

  return c.json({ success: true, data: result });
});

// GET /api/transactions — List transactions for the tenant
transactionsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      type: transactions.type,
      payment_method: transactions.payment_method,
      status: transactions.status,
      description: transactions.description,
      donor_name: transactions.donor_name,
      transaction_date: transactions.transaction_date,
      fund_name: fundCategories.fund_name,
      rejection_reason: transactions.rejection_reason,
      entered_by_name: sql<string>`COALESCE(${persons.first_name} || ' ' || ${persons.last_name}, 'Admin')`,
      project_id: transactions.project_id,
    })
    .from(transactions)
    .leftJoin(fundCategories, eq(transactions.fund_id, fundCategories.id))
    .leftJoin(persons, eq(transactions.admin_id, persons.id))
    .where(eq(transactions.tenant_id, tenantId))
    .orderBy(sql`${transactions.transaction_date} DESC`);

  return c.json({ success: true, data: result });
});

// POST /api/transactions — Create a transaction
transactionsRoute.post('/', requireRole('admin', 'imam', 'treasurer'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  if (!body.fund_id) {
    return c.json({ success: false, error: 'Fund Category (fund_id) is required.' }, 400);
  }

  // Lookup admin from persons using email to map Firebase user -> Person ID
  const adminPerson = user.email
    ? await db.select().from(persons).where(eq(persons.email, user.email)).limit(1)
    : [];
  const adminId = adminPerson.length > 0 ? adminPerson[0].id : null;

  const result = await db
    .insert(transactions)
    .values({
      tenant_id: tenantId,
      admin_id: adminId,
      fund_id: body.fund_id,
      type: body.type || 'Income',
      amount: body.amount !== undefined ? String(body.amount) : '0',
      payment_method: body.payment_method || 'Cash',
      donor_name: body.donor_name || null,
      description: body.description || null,
      notes: body.notes || null,
      reference_number: body.reference_number || null,
      project_id: body.project_id || null, // ST-28.1
      currency: body.currency || 'INR', // Added currency support
      transaction_date: body.transaction_date ? new Date(body.transaction_date) : new Date(),
      status: 'Pending',
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// PATCH /api/transactions/:id/approve — Approve a transaction
transactionsRoute.patch('/:id/approve', requireRole('admin', 'imam', 'treasurer'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;
  const tenantId = c.get('tenantId');
  const user = c.get('user');

  const currentUserPerson = user.email
    ? await db.select().from(persons).where(eq(persons.email, user.email)).limit(1)
    : [];
  const currentUserId = currentUserPerson.length > 0 ? currentUserPerson[0].id : null;

  const [txn] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.tenant_id, tenantId)))
    .limit(1);

  if (!txn) {
    return c.json({ success: false, error: 'Transaction not found' }, 404);
  }

  if (txn.admin_id && currentUserId && txn.admin_id === currentUserId) {
    return c.json({ success: false, error: 'Maker cannot approve their own transaction.' }, 400);
  }

  const result = await db
    .update(transactions)
    .set({
      status: 'Approved',
      approved_by: currentUserId,
      approved_at: new Date(),
      updated_at: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.tenant_id, tenantId)))
    .returning();

  return c.json({ success: true, data: result[0] });
});

// PATCH /api/transactions/:id/reject — Reject a transaction
transactionsRoute.patch('/:id/reject', requireRole('admin', 'imam', 'treasurer'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id') as string;
  const tenantId = c.get('tenantId');
  const user = c.get('user');
  const body = await c.req.json();

  if (!body.rejection_reason) {
    return c.json({ success: false, error: 'rejection_reason is required.' }, 400);
  }

  const currentUserPerson = user.email
    ? await db.select().from(persons).where(eq(persons.email, user.email)).limit(1)
    : [];
  const currentUserId = currentUserPerson.length > 0 ? currentUserPerson[0].id : null;

  const [txn] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.tenant_id, tenantId)))
    .limit(1);

  if (!txn) {
    return c.json({ success: false, error: 'Transaction not found' }, 404);
  }

  if (txn.admin_id && currentUserId && txn.admin_id === currentUserId) {
    return c.json({ success: false, error: 'Maker cannot reject their own transaction.' }, 400);
  }

  const result = await db
    .update(transactions)
    .set({
      status: 'Rejected',
      rejection_reason: body.rejection_reason,
      approved_by: currentUserId,
      approved_at: new Date(),
      updated_at: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.tenant_id, tenantId)))
    .returning();

  return c.json({ success: true, data: result[0] });
});

export default transactionsRoute;
