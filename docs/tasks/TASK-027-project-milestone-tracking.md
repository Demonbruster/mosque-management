# TASK-027: Project Milestone Tracking

**Epic:** Strategic Project Roadmap Planner  
**Priority:** 🟢 P3 — Low  
**Estimate:** 5 days  
**Labels:** `epic: roadmap`, `priority: low`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-026  
**Blocks:** TASK-028

---

## 📋 Story

> **As a** project in-charge,  
> **I want** to break large capital campaigns into measurable milestones, track their completion, and identify bottlenecks,  
> **so that** long-term projects stay on track and risks are caught early.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-27.1** — Create `project_milestones` table: project_id, milestone_name, description, target_date, completion_date, completion_percentage, status (Not_Started/In_Progress/Completed/Delayed), sort_order
- [ ] **ST-27.2** — Build CRUD API for `/api/projects/:id/milestones`
- [ ] **ST-27.3** — Auto-calculate project completion_percentage from average of milestone percentages
- [ ] **ST-27.4** — Create `project_incharge` field on `project_roadmap`: FK to persons

### Frontend

- [ ] **ST-27.5** — Build Milestone Timeline view (Gantt-style): horizontal timeline with milestones as markers
- [ ] **ST-27.6** — Build Milestone CRUD: add, edit, reorder milestones within a project
- [ ] **ST-27.7** — Add status indicators: green (on-track), yellow (at-risk), red (delayed)
- [ ] **ST-27.8** — Show project in-charge assignment and contact info

## 🧪 Acceptance Criteria

- [ ] Milestones roll up into overall project completion percentage
- [ ] Delayed milestones (past target date, not complete) auto-flag as "Delayed"
- [ ] Timeline view clearly shows project progress
- [ ] Milestone reordering works via drag-and-drop
