// ============================================
// WhatsApp Message Templates API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { messageTemplates } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const templatesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/templates — List all templates for the tenant
templatesRoutes.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');

  const result = await db
    .select()
    .from(messageTemplates)
    .where(eq(messageTemplates.tenant_id, tenantId))
    .orderBy(messageTemplates.created_at);

  return c.json({ success: true, data: result });
});

// GET /api/templates/:id — Get details of a specific template
templatesRoutes.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  const result = await db
    .select()
    .from(messageTemplates)
    .where(and(eq(messageTemplates.tenant_id, tenantId), eq(messageTemplates.id, id as string)))
    .limit(1);

  if (result.length === 0) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  return c.json({ success: true, data: result[0] });
});

// POST /api/templates — Create a new template (Draft status)
templatesRoutes.post('/', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const result = await db
    .insert(messageTemplates)
    .values({
      ...body,
      tenant_id: tenantId,
      approval_status: 'Draft',
    })
    .returning();

  return c.json({ success: true, data: result[0] }, 201);
});

// PUT /api/templates/:id — Update an existing template (Only if Draft or Rejected)
templatesRoutes.put('/:id', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const body = await c.req.json();

  // Check if template exists and is editable
  const existing = await db
    .select()
    .from(messageTemplates)
    .where(and(eq(messageTemplates.tenant_id, tenantId), eq(messageTemplates.id, id as string)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  if (existing[0].approval_status === 'Submitted' || existing[0].approval_status === 'Approved') {
    return c.json({ success: false, error: 'Cannot edit an approved or submitted template' }, 400);
  }

  const result = await db
    .update(messageTemplates)
    .set({
      ...body,
      updated_at: new Date(),
    })
    .where(eq(messageTemplates.id, id as string))
    .returning();

  return c.json({ success: true, data: result[0] });
});

// DELETE /api/templates/:id — Delete a template
templatesRoutes.delete('/:id', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  await db
    .delete(messageTemplates)
    .where(and(eq(messageTemplates.tenant_id, tenantId), eq(messageTemplates.id, id as string)));

  return c.json({ success: true, message: 'Template deleted' });
});

// POST /api/templates/:id/submit — Submit template to Twilio/Meta for approval
templatesRoutes.post('/:id/submit', requireRole('admin'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  const result = await db
    .select()
    .from(messageTemplates)
    .where(and(eq(messageTemplates.tenant_id, tenantId), eq(messageTemplates.id, id as string)))
    .limit(1);

  if (result.length === 0) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  // MOCK: In a real implementation, this would call Twilio's Content API
  // https://www.twilio.com/docs/content/api/content-resource#create-content
  console.log(`[TWILIO] Submitting template ${result[0].template_name} for approval...`);

  // Simulate submission
  const updated = await db
    .update(messageTemplates)
    .set({
      approval_status: 'Submitted',
      meta_template_id: `MT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      updated_at: new Date(),
    } as any)
    .where(eq(messageTemplates.id, id as string))
    .returning();

  return c.json({
    success: true,
    message: 'Template submitted for approval',
    data: updated[0],
  });
});

export default templatesRoutes;
