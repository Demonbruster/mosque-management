// ============================================
// Utensil Inventory API Routes — ST-14.2
// ============================================

import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { utensilInventory, utensilRentals } from '../db/schema';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const utensilsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/utensils — List all inventory items with computed available quantity
utensilsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const items = await db
    .select()
    .from(utensilInventory)
    .where(eq(utensilInventory.tenant_id, tenantId));

  // Compute how many of each item are currently out (not returned)
  const activeRentals = await db
    .select({
      utensil_id: utensilRentals.utensil_id,
      quantity_out: sql<number>`SUM(${utensilRentals.quantity})`.as('quantity_out'),
    })
    .from(utensilRentals)
    .where(and(eq(utensilRentals.tenant_id, tenantId), eq(utensilRentals.is_returned, false)))
    .groupBy(utensilRentals.utensil_id);

  const quantityOutMap = new Map(activeRentals.map((r) => [r.utensil_id, r.quantity_out ?? 0]));

  const result = items.map((item) => ({
    ...item,
    quantity_out: Number(quantityOutMap.get(item.id) ?? 0),
    available_quantity: item.stock_quantity - Number(quantityOutMap.get(item.id) ?? 0),
  }));

  return c.json({ success: true, data: result });
});

// GET /api/utensils/:id — Single inventory item
utensilsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(utensilInventory)
    .where(and(eq(utensilInventory.id, id), eq(utensilInventory.tenant_id, tenantId)));

  if (result.length === 0) {
    return c.json({ success: false, error: 'Utensil item not found' }, 404);
  }

  // Get active rental count for this item
  const activeRental = await db
    .select({
      quantity_out: sql<number>`COALESCE(SUM(${utensilRentals.quantity}), 0)`.as('quantity_out'),
    })
    .from(utensilRentals)
    .where(
      and(
        eq(utensilRentals.tenant_id, tenantId),
        eq(utensilRentals.utensil_id, id),
        eq(utensilRentals.is_returned, false),
      ),
    );

  const quantityOut = Number(activeRental[0]?.quantity_out ?? 0);

  return c.json({
    success: true,
    data: {
      ...result[0],
      quantity_out: quantityOut,
      available_quantity: result[0].stock_quantity - quantityOut,
    },
  });
});

// POST /api/utensils — Create a new inventory item
utensilsRoute.post('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const { item_name, description, stock_quantity, rental_price } = body;

  if (!item_name) {
    return c.json({ success: false, error: 'item_name is required' }, 400);
  }
  if (stock_quantity == null || stock_quantity < 0) {
    return c.json({ success: false, error: 'stock_quantity must be a non-negative integer' }, 400);
  }

  const result = await db
    .insert(utensilInventory)
    .values({
      tenant_id: tenantId,
      item_name,
      description,
      stock_quantity: Number(stock_quantity),
      rental_price: rental_price ? String(rental_price) : null,
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// PUT /api/utensils/:id — Update an inventory item
utensilsRoute.put('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const result = await db
    .update(utensilInventory)
    .set({ ...body, updated_at: new Date() })
    .where(and(eq(utensilInventory.id, id), eq(utensilInventory.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Utensil item not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// DELETE /api/utensils/:id — Delete an item (only if no active rentals)
utensilsRoute.delete('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const tenantId = c.get('tenantId');

  // Check for active rentals
  const activeRentals = await db
    .select({ id: utensilRentals.id })
    .from(utensilRentals)
    .where(
      and(
        eq(utensilRentals.utensil_id, id),
        eq(utensilRentals.tenant_id, tenantId),
        eq(utensilRentals.is_returned, false),
      ),
    )
    .limit(1);

  if (activeRentals.length > 0) {
    return c.json(
      { success: false, error: 'Cannot delete item with active (unreturned) rentals' },
      409,
    );
  }

  const result = await db
    .delete(utensilInventory)
    .where(and(eq(utensilInventory.id, id), eq(utensilInventory.tenant_id, tenantId)))
    .returning();

  if (result.length === 0) {
    return c.json({ success: false, error: 'Utensil item not found' }, 404);
  }

  return c.json({ success: true, data: { deleted: true } });
});

export default utensilsRoute;
