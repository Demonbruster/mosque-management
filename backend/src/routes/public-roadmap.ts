// ============================================
// Public Roadmap API Routes — TASK-026  (ST-26.1)
// ============================================
// Publicly accessible — no authentication required.
// Returns roadmap projects grouped by phase for the
// community-facing roadmap page.
//
// Route:
//   GET /api/public/roadmap?tenant_id=<uuid>
//
// Compatible with Cloudflare Workers + Hono + Neon serverless.
// ============================================

import { Hono } from 'hono';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { projectRoadmap } from '../db/schema';

interface GroupedRoadmap {
  past: (typeof projectRoadmap.$inferSelect)[];
  present: (typeof projectRoadmap.$inferSelect)[];
  future: (typeof projectRoadmap.$inferSelect)[];
}

const publicRoadmapRoute = new Hono<{ Bindings: Env }>();

// -------------------------------------------------------
// GET /api/public/roadmap?tenant_id=<uuid>
//
// Returns projects grouped by phase:
//   { past: [...], present: [...], future: [...] }
//
// Ordering:
//   Past    → target_end_date DESC  (most recent completions first)
//   Present → completion_percentage DESC (closest to done first)
//   Future  → estimated_budget DESC (biggest vision first)
// -------------------------------------------------------
publicRoadmapRoute.get('/', async (c) => {
  const tenantId = c.req.query('tenant_id');

  if (!tenantId) {
    return c.json({ success: false, error: 'tenant_id is required' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  // Fetch all three phases in parallel
  const [past, present, future] = await Promise.all([
    db
      .select()
      .from(projectRoadmap)
      .where(and(eq(projectRoadmap.tenant_id, tenantId), eq(projectRoadmap.phase, 'Past')))
      .orderBy(desc(projectRoadmap.target_end_date)),

    db
      .select()
      .from(projectRoadmap)
      .where(and(eq(projectRoadmap.tenant_id, tenantId), eq(projectRoadmap.phase, 'Present')))
      .orderBy(desc(projectRoadmap.completion_percentage)),

    db
      .select()
      .from(projectRoadmap)
      .where(and(eq(projectRoadmap.tenant_id, tenantId), eq(projectRoadmap.phase, 'Future')))
      .orderBy(asc(projectRoadmap.project_name)),
  ]);

  const grouped: GroupedRoadmap = { past, present, future };

  return c.json({
    success: true,
    data: grouped,
    meta: {
      total: past.length + present.length + future.length,
    },
  });
});

export default publicRoadmapRoute;
