// ============================================
// Utensil Rentals API Routes — ST-14.3 to ST-14.6
// ============================================

import { Hono } from 'hono';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { utensilRentals, utensilInventory, persons } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const utensilRentalsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// ─────────────────────────────────────────────────────────────────────
// GET /api/utensil-rentals/outstanding — ST-14.5
// All unreturned rentals with borrower, guarantor, and item info
// ─────────────────────────────────────────────────────────────────────
utensilRentalsRoute.get('/outstanding', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  // Alias persons table for guarantor join
  const borrower = persons;
  const guarantorAlias = {
    id: persons.id,
    first_name: persons.first_name,
    last_name: persons.last_name,
    phone_number: persons.phone_number,
  };

  const result = await db
    .select({
      id: utensilRentals.id,
      quantity: utensilRentals.quantity,
      issue_date: utensilRentals.issue_date,
      notes: utensilRentals.notes,
      penalty_fee: utensilRentals.penalty_fee,
      item_name: utensilInventory.item_name,
      rental_price: utensilInventory.rental_price,
      borrower_id: borrower.id,
      borrower_name: sql<string>`concat(${borrower.first_name}, ' ', ${borrower.last_name})`.as(
        'borrower_name',
      ),
      borrower_phone: borrower.phone_number,
      borrower_category: borrower.category,
    })
    .from(utensilRentals)
    .innerJoin(utensilInventory, eq(utensilRentals.utensil_id, utensilInventory.id))
    .innerJoin(borrower, eq(utensilRentals.customer_id, borrower.id))
    .where(and(eq(utensilRentals.tenant_id, tenantId), eq(utensilRentals.is_returned, false)))
    .orderBy(desc(utensilRentals.issue_date));

  // Enrich with guarantor data (separate query to avoid complex multi-alias join)
  const rentalIds = result.map((r) => r.id);
  let guarantorMap: Record<
    string,
    {
      guarantor_id: string;
      guarantor_name: string;
      guarantor_phone: string | null;
    } | null
  > = {};

  if (rentalIds.length > 0) {
    const guarantorData = await db
      .select({
        rental_id: utensilRentals.id,
        guarantor_id: utensilRentals.guarantor_id,
        guarantor_name: sql<string>`concat(${persons.first_name}, ' ', ${persons.last_name})`.as(
          'guarantor_name',
        ),
        guarantor_phone: persons.phone_number,
      })
      .from(utensilRentals)
      .innerJoin(persons, eq(utensilRentals.guarantor_id, persons.id))
      .where(and(eq(utensilRentals.tenant_id, tenantId), eq(utensilRentals.is_returned, false)));

    guarantorMap = Object.fromEntries(
      guarantorData.map((g) => [
        g.rental_id,
        {
          guarantor_id: g.guarantor_id!,
          guarantor_name: g.guarantor_name,
          guarantor_phone: g.guarantor_phone,
        },
      ]),
    );
  }

  // Compute overdue days
  const today = new Date();
  const enriched = result.map((r) => {
    const issueDate = new Date(r.issue_date);
    const overdueDays = Math.max(0, Math.floor((today.getTime() - issueDate.getTime()) / 86400000));
    return {
      ...r,
      overdue_days: overdueDays,
      guarantor: guarantorMap[r.id] || null,
    };
  });

  return c.json({ success: true, data: enriched });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/utensil-rentals — list all rentals
// ─────────────────────────────────────────────────────────────────────
utensilRentalsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const isReturnedFilter = c.req.query('is_returned');

  const conditions = [eq(utensilRentals.tenant_id, tenantId)];
  if (isReturnedFilter === 'true') conditions.push(eq(utensilRentals.is_returned, true));
  if (isReturnedFilter === 'false') conditions.push(eq(utensilRentals.is_returned, false));

  const result = await db
    .select({
      id: utensilRentals.id,
      quantity: utensilRentals.quantity,
      issue_date: utensilRentals.issue_date,
      return_date: utensilRentals.return_date,
      is_returned: utensilRentals.is_returned,
      penalty_fee: utensilRentals.penalty_fee,
      notes: utensilRentals.notes,
      item_name: utensilInventory.item_name,
      borrower_name: sql<string>`concat(${persons.first_name}, ' ', ${persons.last_name})`.as(
        'borrower_name',
      ),
    })
    .from(utensilRentals)
    .innerJoin(utensilInventory, eq(utensilRentals.utensil_id, utensilInventory.id))
    .innerJoin(persons, eq(utensilRentals.customer_id, persons.id))
    .where(and(...conditions))
    .orderBy(desc(utensilRentals.created_at));

  return c.json({ success: true, data: result });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/utensil-rentals/:id — single rental detail + voucher data
// ─────────────────────────────────────────────────────────────────────
utensilRentalsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      id: utensilRentals.id,
      quantity: utensilRentals.quantity,
      issue_date: utensilRentals.issue_date,
      return_date: utensilRentals.return_date,
      is_returned: utensilRentals.is_returned,
      quantity_returned: utensilRentals.quantity_returned,
      damage_description: utensilRentals.damage_description,
      penalty_fee: utensilRentals.penalty_fee,
      notes: utensilRentals.notes,
      created_at: utensilRentals.created_at,
      utensil_id: utensilInventory.id,
      item_name: utensilInventory.item_name,
      rental_price: utensilInventory.rental_price,
      customer_id: persons.id,
      borrower_name: sql<string>`concat(${persons.first_name}, ' ', ${persons.last_name})`.as(
        'borrower_name',
      ),
      borrower_phone: persons.phone_number,
      borrower_category: persons.category,
    })
    .from(utensilRentals)
    .innerJoin(utensilInventory, eq(utensilRentals.utensil_id, utensilInventory.id))
    .innerJoin(persons, eq(utensilRentals.customer_id, persons.id))
    .where(and(eq(utensilRentals.id, id), eq(utensilRentals.tenant_id, tenantId)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Rental not found' }, 404);
  }

  // Fetch guarantor info separately if present
  const rentalRaw = await db
    .select({ guarantor_id: utensilRentals.guarantor_id })
    .from(utensilRentals)
    .where(and(eq(utensilRentals.id, id), eq(utensilRentals.tenant_id, tenantId)));

  let guarantorInfo = null;
  if (rentalRaw[0]?.guarantor_id) {
    const gData = await db
      .select({
        id: persons.id,
        name: sql<string>`concat(${persons.first_name}, ' ', ${persons.last_name})`.as('name'),
        phone_number: persons.phone_number,
      })
      .from(persons)
      .where(eq(persons.id, rentalRaw[0].guarantor_id));
    guarantorInfo = gData[0] || null;
  }

  return c.json({ success: true, data: { ...result[0], guarantor: guarantorInfo } });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/utensil-rentals/:id/voucher — ST-14.6
// Returns structured data for client-side print voucher
// ─────────────────────────────────────────────────────────────────────
utensilRentalsRoute.get('/:id/voucher', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .select({
      id: utensilRentals.id,
      quantity: utensilRentals.quantity,
      issue_date: utensilRentals.issue_date,
      return_date: utensilRentals.return_date,
      is_returned: utensilRentals.is_returned,
      quantity_returned: utensilRentals.quantity_returned,
      damage_description: utensilRentals.damage_description,
      penalty_fee: utensilRentals.penalty_fee,
      notes: utensilRentals.notes,
      item_name: utensilInventory.item_name,
      rental_price: utensilInventory.rental_price,
      borrower_name: sql<string>`concat(${persons.first_name}, ' ', ${persons.last_name})`.as(
        'borrower_name',
      ),
      borrower_phone: persons.phone_number,
      borrower_category: persons.category,
    })
    .from(utensilRentals)
    .innerJoin(utensilInventory, eq(utensilRentals.utensil_id, utensilInventory.id))
    .innerJoin(persons, eq(utensilRentals.customer_id, persons.id))
    .where(and(eq(utensilRentals.id, id), eq(utensilRentals.tenant_id, tenantId)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Rental not found' }, 404);
  }

  // Fetch guarantor separately
  const rentalRaw = await db
    .select({ guarantor_id: utensilRentals.guarantor_id })
    .from(utensilRentals)
    .where(and(eq(utensilRentals.id, id), eq(utensilRentals.tenant_id, tenantId)));

  let guarantorInfo = null;
  if (rentalRaw[0]?.guarantor_id) {
    const gData = await db
      .select({
        id: persons.id,
        name: sql<string>`concat(${persons.first_name}, ' ', ${persons.last_name})`.as('name'),
        phone_number: persons.phone_number,
      })
      .from(persons)
      .where(eq(persons.id, rentalRaw[0].guarantor_id));
    guarantorInfo = gData[0] || null;
  }

  const voucher = {
    voucher_type: result[0].is_returned ? 'RETURN' : 'ISSUE',
    rental: result[0],
    guarantor: guarantorInfo,
    generated_at: new Date().toISOString(),
  };

  return c.json({ success: true, data: voucher });
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/utensil-rentals/issue — ST-14.3
// ─────────────────────────────────────────────────────────────────────
utensilRentalsRoute.post('/issue', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const { utensil_id, customer_id, guarantor_id, quantity, issue_date, notes } = body;

  if (!utensil_id || !customer_id || !quantity || !issue_date) {
    return c.json(
      { success: false, error: 'utensil_id, customer_id, quantity, and issue_date are required' },
      400,
    );
  }

  // Validate borrower exists + category check
  const borrowerData = await db
    .select({ id: persons.id, category: persons.category })
    .from(persons)
    .where(and(eq(persons.id, customer_id), eq(persons.tenant_id, tenantId)));

  if (borrowerData.length === 0) {
    return c.json({ success: false, error: 'Borrower not found' }, 404);
  }

  // ST-14.1 enforcement: Non-Member requires guarantor
  if (borrowerData[0].category === 'Non-Member' && !guarantor_id) {
    return c.json(
      {
        success: false,
        error: 'Guarantor (guarantor_id) is required for Non-Member borrowers',
      },
      422,
    );
  }

  // Validate guarantor exists if provided
  if (guarantor_id) {
    const guarantorData = await db
      .select({ id: persons.id })
      .from(persons)
      .where(and(eq(persons.id, guarantor_id), eq(persons.tenant_id, tenantId)));
    if (guarantorData.length === 0) {
      return c.json({ success: false, error: 'Guarantor not found' }, 404);
    }
  }

  // Check available stock
  const inventoryData = await db
    .select({ stock_quantity: utensilInventory.stock_quantity })
    .from(utensilInventory)
    .where(and(eq(utensilInventory.id, utensil_id), eq(utensilInventory.tenant_id, tenantId)));

  if (inventoryData.length === 0) {
    return c.json({ success: false, error: 'Utensil item not found' }, 404);
  }

  const activelyRented = await db
    .select({
      total_out: sql<number>`COALESCE(SUM(${utensilRentals.quantity}), 0)`.as('total_out'),
    })
    .from(utensilRentals)
    .where(
      and(
        eq(utensilRentals.utensil_id, utensil_id),
        eq(utensilRentals.tenant_id, tenantId),
        eq(utensilRentals.is_returned, false),
      ),
    );

  const totalOut = Number(activelyRented[0]?.total_out ?? 0);
  const availableQty = inventoryData[0].stock_quantity - totalOut;

  if (quantity > availableQty) {
    return c.json(
      {
        success: false,
        error: `Only ${availableQty} unit(s) available (${totalOut} currently out)`,
      },
      409,
    );
  }

  // Create rental record — stock is tracked virtually (via active rentals sum)
  const result = await db
    .insert(utensilRentals)
    .values({
      tenant_id: tenantId,
      customer_id,
      guarantor_id: guarantor_id || null,
      utensil_id,
      quantity: Number(quantity),
      issue_date,
      notes: notes || null,
      is_returned: false,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/utensil-rentals/:id/return — ST-14.4
// ─────────────────────────────────────────────────────────────────────
utensilRentalsRoute.post('/:id/return', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const { quantity_returned, damage_description, additional_penalty, return_date, notes } = body;

  // Fetch the original rental
  const rentalData = await db
    .select({
      id: utensilRentals.id,
      quantity: utensilRentals.quantity,
      is_returned: utensilRentals.is_returned,
      utensil_id: utensilRentals.utensil_id,
    })
    .from(utensilRentals)
    .where(and(eq(utensilRentals.id, id), eq(utensilRentals.tenant_id, tenantId)));

  if (rentalData.length === 0) {
    return c.json({ success: false, error: 'Rental not found' }, 404);
  }

  if (rentalData[0].is_returned) {
    return c.json({ success: false, error: 'This rental has already been returned' }, 409);
  }

  const qtyReturned = quantity_returned ?? rentalData[0].quantity;

  if (qtyReturned < 0 || qtyReturned > rentalData[0].quantity) {
    return c.json(
      {
        success: false,
        error: `quantity_returned must be between 0 and ${rentalData[0].quantity}`,
      },
      400,
    );
  }

  // Auto-calculate penalty: missing_qty × rental_price + additional damage
  const inventoryData = await db
    .select({ rental_price: utensilInventory.rental_price })
    .from(utensilInventory)
    .where(eq(utensilInventory.id, rentalData[0].utensil_id));

  const rentalPrice = parseFloat(inventoryData[0]?.rental_price ?? '0');
  const missingQty = rentalData[0].quantity - qtyReturned;
  const missingPenalty = missingQty * rentalPrice;
  const damageAmount = parseFloat(additional_penalty ?? '0');
  const totalPenalty = missingPenalty + damageAmount;

  const returnDateValue = return_date ?? new Date().toISOString().split('T')[0];

  const result = await db
    .update(utensilRentals)
    .set({
      is_returned: true,
      return_date: returnDateValue,
      quantity_returned: qtyReturned,
      damage_description: damage_description || null,
      penalty_fee: String(totalPenalty),
      notes: notes || null,
      updated_at: new Date(),
    })
    .where(and(eq(utensilRentals.id, id), eq(utensilRentals.tenant_id, tenantId)))
    .returning();

  // Note: stock is tracked via active rentals sum (is_returned=false),
  // marking as returned automatically restores available_quantity.
  // No explicit stock_quantity increment needed.

  return c.json({
    success: true,
    data: {
      ...result[0],
      penalty_breakdown: {
        missing_quantity: missingQty,
        price_per_item: rentalPrice,
        missing_penalty: missingPenalty,
        damage_penalty: damageAmount,
        total_penalty: totalPenalty,
      },
    },
  });
});

export default utensilRentalsRoute;
