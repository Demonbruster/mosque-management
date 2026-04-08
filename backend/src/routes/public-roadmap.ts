// ============================================
// Public Roadmap API Routes — TASK-026 + TASK-027
// ============================================
// Publicly accessible — no authentication required.
// Returns roadmap projects grouped by phase, with
// milestones and in-charge info for each project.
//
// Route:
//   GET /api/public/roadmap?tenant_id=<uuid>
// ============================================

import { Hono } from 'hono';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { Env } from '../db/client';
import { createDb } from '../db/client';
import { projectRoadmap, projectMilestones, persons } from '../db/schema';

const publicRoadmapRoute = new Hono<{ Bindings: Env }>();

// Helper: compute delayed status for a milestone
function computeMilestoneStatus(ms: typeof projectMilestones.$inferSelect): string {
  if (ms.status === 'Completed') return 'Completed';
  if (ms.target_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(ms.target_date) < today) return 'Delayed';
  }
  return ms.status;
}

// -------------------------------------------------------
// GET /api/public/roadmap?tenant_id=<uuid>
// Returns projects grouped by phase with milestones
// -------------------------------------------------------
publicRoadmapRoute.get('/', async (c) => {
  const tenantId = c.req.query('tenant_id');

  if (!tenantId) {
    return c.json({ success: false, error: 'tenant_id is required' }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  // Fetch projects for each phase in parallel (with incharge join)
  const [pastRaw, presentRaw, futureRaw] = await Promise.all([
    db
      .select({
        project: projectRoadmap,
        incharge_first_name: persons.first_name,
        incharge_last_name: persons.last_name,
        incharge_phone: persons.phone_number,
      })
      .from(projectRoadmap)
      .leftJoin(persons, eq(projectRoadmap.project_incharge, persons.id))
      .where(and(eq(projectRoadmap.tenant_id, tenantId), eq(projectRoadmap.phase, 'Past')))
      .orderBy(desc(projectRoadmap.target_end_date)),

    db
      .select({
        project: projectRoadmap,
        incharge_first_name: persons.first_name,
        incharge_last_name: persons.last_name,
        incharge_phone: persons.phone_number,
      })
      .from(projectRoadmap)
      .leftJoin(persons, eq(projectRoadmap.project_incharge, persons.id))
      .where(and(eq(projectRoadmap.tenant_id, tenantId), eq(projectRoadmap.phase, 'Present')))
      .orderBy(desc(projectRoadmap.completion_percentage)),

    db
      .select({
        project: projectRoadmap,
        incharge_first_name: persons.first_name,
        incharge_last_name: persons.last_name,
        incharge_phone: persons.phone_number,
      })
      .from(projectRoadmap)
      .leftJoin(persons, eq(projectRoadmap.project_incharge, persons.id))
      .where(and(eq(projectRoadmap.tenant_id, tenantId), eq(projectRoadmap.phase, 'Future')))
      .orderBy(asc(projectRoadmap.project_name)),
  ]);

  // Collect all project IDs to fetch milestones in one query
  const allProjects = [...pastRaw, ...presentRaw, ...futureRaw];
  const projectIds = allProjects.map((r) => r.project.id);

  // Fetch all milestones for all projects in one query
  let milestonesMap: Record<
    string,
    (typeof projectMilestones.$inferSelect & { status: string })[]
  > = {};

  if (projectIds.length > 0) {
    const allMilestones = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.tenant_id, tenantId))
      .orderBy(asc(projectMilestones.sort_order));

    // Group by project_id
    milestonesMap = allMilestones
      .filter((ms) => projectIds.includes(ms.project_id))
      .reduce(
        (acc, ms) => {
          if (!acc[ms.project_id]) acc[ms.project_id] = [];
          acc[ms.project_id].push({
            ...ms,
            status: computeMilestoneStatus(ms) as
              | 'Not_Started'
              | 'In_Progress'
              | 'Completed'
              | 'Delayed',
          });
          return acc;
        },
        {} as Record<string, (typeof projectMilestones.$inferSelect & { status: string })[]>,
      );
  }

  // Shape each raw row into the final response object
  const shapeProject = (r: (typeof pastRaw)[0]) => ({
    ...r.project,
    incharge_name: r.incharge_first_name
      ? `${r.incharge_first_name} ${r.incharge_last_name ?? ''}`.trim()
      : null,
    incharge_phone: r.incharge_phone ?? null,
    milestones: milestonesMap[r.project.id] ?? [],
  });

  const past = pastRaw.map(shapeProject);
  const present = presentRaw.map(shapeProject);
  const future = futureRaw.map(shapeProject);

  return c.json({
    success: true,
    data: { past, present, future },
    meta: { total: past.length + present.length + future.length },
  });
});

export default publicRoadmapRoute;
