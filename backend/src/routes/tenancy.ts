// ============================================
// Tenancy & Rentals API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { tenancyAgreements, rentPayments, persons, fixedAssets } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const tenancyRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/tenancy-agreements/reports/rent-due
tenancyRoute.get('/reports/rent-due', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  // To find overdue, we compare start_date to current date
  // and see if rent_payments covers the months.
  // For simplicity, we just return active agreements and let UI do matching
  // OR we do a joined query: all active agreements joined with person info.

  const result = await db
    .select({
      id: tenancyAgreements.id,
      rent_amount: tenancyAgreements.rent_amount,
      start_date: tenancyAgreements.start_date,
      person_name: sql`concat(${persons.first_name}, ' ', ${persons.last_name})`.as('person_name'),
      property_name: fixedAssets.name,
      phone_number: persons.phone_number,
    })
    .from(tenancyAgreements)
    .innerJoin(persons, eq(tenancyAgreements.person_id, persons.id))
    .innerJoin(fixedAssets, eq(tenancyAgreements.asset_id, fixedAssets.id))
    .where(and(eq(tenancyAgreements.tenant_id, tenantId), eq(tenancyAgreements.status, 'Active')));

  // Get payments for these agreements
  if (result.length > 0) {
    const agreementIds = result.map((r) => r.id);
    const payments = await db
      .select()
      .from(rentPayments)
      .where(and(eq(rentPayments.tenant_id, tenantId)));

    // simple mapping in memory to see if current month is paid
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const overdueList = result
      .map((agg) => {
        const aggPayments = payments.filter((p) => p.agreement_id === agg.id);
        const isPaidThisMonth = aggPayments.some((p) => p.month === curMonth && p.year === curYear);
        return {
          ...agg,
          is_overdue: !isPaidThisMonth,
          last_payment:
            aggPayments.sort(
              (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
            )[0] || null,
        };
      })
      .filter((agg) => agg.is_overdue);

    return c.json({ success: true, data: overdueList });
  }

  return c.json({ success: true, data: [] });
});

// GET /api/tenancy-agreements
tenancyRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      id: tenancyAgreements.id,
      rent_amount: tenancyAgreements.rent_amount,
      start_date: tenancyAgreements.start_date,
      end_date: tenancyAgreements.end_date,
      status: tenancyAgreements.status,
      security_deposit: tenancyAgreements.security_deposit,
      person: {
        id: persons.id,
        first_name: persons.first_name,
        last_name: persons.last_name,
      },
      asset: {
        id: fixedAssets.id,
        name: fixedAssets.name,
      },
    })
    .from(tenancyAgreements)
    .innerJoin(persons, eq(tenancyAgreements.person_id, persons.id))
    .innerJoin(fixedAssets, eq(tenancyAgreements.asset_id, fixedAssets.id))
    .where(eq(tenancyAgreements.tenant_id, tenantId));

  return c.json({ success: true, data: result });
});

// GET /api/tenancy-agreements/:id
tenancyRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const agreement = await db
    .select({
      id: tenancyAgreements.id,
      rent_amount: tenancyAgreements.rent_amount,
      start_date: tenancyAgreements.start_date,
      end_date: tenancyAgreements.end_date,
      status: tenancyAgreements.status,
      security_deposit: tenancyAgreements.security_deposit,
      notes: tenancyAgreements.notes,
      person: {
        id: persons.id,
        first_name: persons.first_name,
        last_name: persons.last_name,
        phone_number: persons.phone_number,
      },
      asset: {
        id: fixedAssets.id,
        name: fixedAssets.name,
      },
    })
    .from(tenancyAgreements)
    .innerJoin(persons, eq(tenancyAgreements.person_id, persons.id))
    .innerJoin(fixedAssets, eq(tenancyAgreements.asset_id, fixedAssets.id))
    .where(and(eq(tenancyAgreements.id, id), eq(tenancyAgreements.tenant_id, tenantId)));

  if (agreement.length === 0) {
    return c.json({ success: false, error: 'Agreement not found' }, 404);
  }

  const payments = await db
    .select()
    .from(rentPayments)
    .where(and(eq(rentPayments.agreement_id, id), eq(rentPayments.tenant_id, tenantId)))
    .orderBy(desc(rentPayments.payment_date));

  return c.json({ success: true, data: { ...agreement[0], payments } });
});

// POST /api/tenancy-agreements
tenancyRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const result = await db
    .insert(tenancyAgreements)
    .values({ ...body, tenant_id: tenantId, status: 'Active' })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// POST /api/tenancy-agreements/:id/terminate
tenancyRoute.post('/:id/terminate', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const { refund_amount, deductions, notes } = body;

  const agreement = await db
    .select()
    .from(tenancyAgreements)
    .where(and(eq(tenancyAgreements.id, id), eq(tenancyAgreements.tenant_id, tenantId)));

  if (agreement.length === 0) {
    return c.json({ success: false, error: 'Agreement not found' }, 404);
  }

  const existingNotes = agreement[0].notes || '';
  const terminationReason = `Termination Info: Refund: ${refund_amount}, Deductions: ${deductions}. Notes: ${notes}`;
  const mergedNotes = `${existingNotes}\n[${new Date().toISOString()}] ${terminationReason}`.trim();

  const result = await db
    .update(tenancyAgreements)
    .set({
      status: 'Terminated',
      end_date: new Date().toISOString().split('T')[0],
      notes: mergedNotes,
      updated_at: new Date(),
    })
    .where(and(eq(tenancyAgreements.id, id), eq(tenancyAgreements.tenant_id, tenantId)))
    .returning();

  return c.json({ success: true, data: result[0] });
});

// POST /api/tenancy-agreements/:id/rent-payment
tenancyRoute.post('/:id/rent-payment', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const agreement = await db
    .select()
    .from(tenancyAgreements)
    .where(and(eq(tenancyAgreements.id, id), eq(tenancyAgreements.tenant_id, tenantId)));

  if (agreement.length === 0) {
    return c.json({ success: false, error: 'Agreement not found' }, 404);
  }

  const result = await db
    .insert(rentPayments)
    .values({
      ...body,
      tenant_id: tenantId,
      agreement_id: id,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

export default tenancyRoute;
