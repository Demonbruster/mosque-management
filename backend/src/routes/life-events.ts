// ============================================
// Life Events API Routes
// ============================================

import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { lifeEventRecords, persons, personRelationships } from '../db/schema';
import { requireRole } from '../middleware/firebase-auth';
import type { AuthUser } from '../middleware/firebase-auth';

type Variables = { user: AuthUser; tenantId: string };

const lifeEventsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/life-events — List all life events
lifeEventsRoute.get('/', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const eventType = c.req.query('event_type');
  const personId = c.req.query('person_id');

  // To simplify for now without `or`, let's just return all for tenant if no specific or just filter by person_a_id
  const result = await db
    .select({
      id: lifeEventRecords.id,
      event_type: lifeEventRecords.event_type,
      event_date: lifeEventRecords.event_date,
      certificate_no: lifeEventRecords.certificate_no,
      location: lifeEventRecords.location,
      person_a_id: lifeEventRecords.person_a_id,
      person_b_id: lifeEventRecords.person_b_id,
      document_urls: lifeEventRecords.document_urls,
      created_at: lifeEventRecords.created_at,
    })
    .from(lifeEventRecords)
    .where(eq(lifeEventRecords.tenant_id, tenantId))
    .orderBy(desc(lifeEventRecords.event_date));

  // Client side can filter personId if needed or we refine query.
  const finalResult = personId
    ? result.filter((r) => r.person_a_id === personId || r.person_b_id === personId)
    : eventType
      ? result.filter((r) => r.event_type === eventType)
      : result;

  return c.json({ success: true, data: finalResult });
});

// GET /api/life-events/:id — Get details
lifeEventsRoute.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  const result = await db
    .select()
    .from(lifeEventRecords)
    .where(and(eq(lifeEventRecords.id, id), eq(lifeEventRecords.tenant_id, tenantId)));

  if (result.length === 0) return c.json({ success: false, error: 'Not found' }, 404);

  return c.json({ success: true, data: result[0] });
});

// POST /api/life-events — Create life event
lifeEventsRoute.post('/', requireRole('admin', 'imam'), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const body = await c.req.json();

  const { event_type, person_a_id, person_b_id, event_date, location, notes, document_urls } = body;

  const result = await db.transaction(async (tx) => {
    // 1. Generate sequential certificate number
    const existing = await tx
      .select()
      .from(lifeEventRecords)
      .where(
        and(eq(lifeEventRecords.tenant_id, tenantId), eq(lifeEventRecords.event_type, event_type)),
      );

    const count = existing.length + 1;
    const prefix = event_type.substring(0, 3).toUpperCase();
    const year = new Date(event_date).getFullYear();
    const certNo = `${prefix}-${year}-${count.toString().padStart(3, '0')}`;

    // 2. Insert record
    const [inserted] = await tx
      .insert(lifeEventRecords)
      .values({
        tenant_id: tenantId,
        event_type,
        person_a_id,
        person_b_id,
        event_date,
        location,
        notes,
        document_urls: document_urls || [],
        certificate_no: certNo,
      })
      .returning();

    // 3. Automations
    if (event_type === 'Marriage' && person_a_id && person_b_id) {
      await tx.insert(personRelationships).values({
        person_id_a: person_a_id,
        person_id_b: person_b_id,
        relationship_code: 'Spouse',
      });
      await tx.insert(personRelationships).values({
        person_id_a: person_b_id,
        person_id_b: person_a_id,
        relationship_code: 'Spouse',
      });
    }

    if (event_type === 'Death' && person_a_id) {
      await tx.update(persons).set({ is_active: false }).where(eq(persons.id, person_a_id));
    }

    return inserted;
  });

  return c.json({ success: true, data: result }, 201);
});

// GET /api/life-events/:id/certificate — Generate PDF
lifeEventsRoute.get('/:id/certificate', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  const [eventRecord] = await db
    .select()
    .from(lifeEventRecords)
    .where(and(eq(lifeEventRecords.id, id), eq(lifeEventRecords.tenant_id, tenantId)));

  if (!eventRecord) return c.json({ success: false, error: 'Not found' }, 404);

  // Fetch person details
  const [personA] = await db.select().from(persons).where(eq(persons.id, eventRecord.person_a_id));
  const personB = eventRecord.person_b_id
    ? (await db.select().from(persons).where(eq(persons.id, eventRecord.person_b_id)))[0]
    : null;

  // Generate PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Draw Letterhead Header
  page.drawText('MOSQUE MANAGEMENT SYSTEM', {
    x: 160,
    y: height - 80,
    size: 18,
    font: boldFont,
    color: rgb(0, 0.3, 0),
  });
  page.drawText('Official Certification Document', {
    x: 210,
    y: height - 100,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawLine({
    start: { x: 50, y: height - 110 },
    end: { x: width - 50, y: height - 110 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Draw Certificate Title
  let title = 'CERTIFICATE';
  if (eventRecord.event_type === 'Marriage') title = 'CERTIFICATE OF MARRIAGE';
  if (eventRecord.event_type === 'Death') title = 'CERTIFICATE OF DEATH';
  if (eventRecord.event_type === 'Divorce') title = 'CERTIFICATE OF DIVORCE';

  page.drawText(title, {
    x: width / 2 - font.widthOfTextAtSize(title, 20) / 2,
    y: height - 160,
    size: 20,
    font: boldFont,
  });

  page.drawText(`Certificate No: ${eventRecord.certificate_no}`, {
    x: 50,
    y: height - 200,
    size: 10,
    font,
  });
  page.drawText(`Date of Issue: ${new Date().toISOString().split('T')[0]}`, {
    x: width - 180,
    y: height - 200,
    size: 10,
    font,
  });

  // Draw Body Content
  let yPos = height - 250;
  const drawLine = (label: string, value: string) => {
    page.drawText(label, { x: 50, y: yPos, size: 12, font: boldFont });
    page.drawText(value, { x: 200, y: yPos, size: 12, font });
    yPos -= 25;
  };

  drawLine('Event Type:', eventRecord.event_type);
  drawLine('Event Date:', new Date(eventRecord.event_date).toDateString());
  drawLine('Location:', eventRecord.location || 'Mosque Premises');

  yPos -= 20;

  if (eventRecord.event_type === 'Marriage') {
    drawLine('Groom Details:', `${personA.first_name} ${personA.last_name}`);
    if (personB) drawLine('Bride Details:', `${personB.first_name} ${personB.last_name}`);
  } else if (eventRecord.event_type === 'Death') {
    drawLine('Deceased Name:', `${personA.first_name} ${personA.last_name}`);
  } else {
    drawLine('Primary Person:', `${personA.first_name} ${personA.last_name}`);
    if (personB) drawLine('Secondary Person:', `${personB.first_name} ${personB.last_name}`);
  }

  yPos -= 40;
  if (eventRecord.notes) {
    page.drawText('Additional Notes:', { x: 50, y: yPos, size: 12, font: boldFont });
    yPos -= 20;
    // Simple text wrapping (naive)
    const notesStr = eventRecord.notes;
    page.drawText(notesStr.substring(0, 80), { x: 50, y: yPos, size: 10, font });
  }

  // Draw Footer Signature
  page.drawText('Authorized Signatory', { x: width - 200, y: 150, size: 12, font });
  page.drawLine({
    start: { x: width - 220, y: 140 },
    end: { x: width - 50, y: 140 },
    thickness: 1,
  });
  page.drawText('Mosque Administrator', { x: width - 195, y: 125, size: 10, font: boldFont });

  const pdfBytes = await pdfDoc.save();

  // Return PDF as buffer
  c.header('Content-Type', 'application/pdf');
  c.header('Content-Disposition', `inline; filename="${eventRecord.certificate_no}.pdf"`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return c.body(pdfBytes as any);
});

export default lifeEventsRoute;
