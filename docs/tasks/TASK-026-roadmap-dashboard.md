# TASK-026: Public Mosque Roadmap Dashboard

**Epic:** Strategic Project Roadmap Planner  
**Priority:** 🟢 P3 — Low  
**Estimate:** 5 days  
**Labels:** `epic: roadmap`, `priority: low`, `type: frontend`  
**Assignee:** _TBD_  
**Blocked by:** TASK-008  
**Blocks:** TASK-027

---

## 📋 Story

> **As a** mosque community member,  
> **I want** to see a public visual roadmap showing the mosque's past achievements, current active projects, and future aspirations — with goal thermometers and progress bars,  
> **so that** I feel inspired to contribute and can see how my donations are being used.

## ✅ Current Status

- ✅ `project_roadmap` table with project_name, phase (Past/Present/Future), estimated_budget, actual_spend, completion_percentage
- ⬜ No CRUD API or UI

## 📝 Sub-Tasks

### Backend

- [ ] **ST-26.1** — Build `GET /api/projects/roadmap` (public, no auth) — returns projects grouped by phase (Past/Present/Future)
- [ ] **ST-26.2** — Build admin CRUD API for `/api/projects` (create, update, update phase, delete)

### Frontend

- [ ] **ST-26.3** — Build Public Roadmap page (`/roadmap`):
  - **Past** section: completed projects with success checkmarks
  - **Present** section: active projects with progress bars and goal thermometers
  - **Future** section: aspirational projects with estimated budgets
- [ ] **ST-26.4** — Design goal thermometer component: shows funds raised vs target
- [ ] **ST-26.5** — Design progress bar component: completion percentage with milestone markers
- [ ] **ST-26.6** — Make fully responsive and visually engaging (inspire donations)
- [ ] **ST-26.7** — Add "Contribute to this project" CTA button linking to donation flow

### Admin

- [ ] **ST-26.8** — Build Admin Project Manager page (`/admin/projects`): CRUD for projects, update progress, move between phases

## 🧪 Acceptance Criteria

- [ ] Public roadmap loads without authentication
- [ ] Projects display in chronological Past → Present → Future layout
- [ ] Goal thermometers accurately reflect funds raised vs target
- [ ] Progress bars show real-time completion percentages
- [ ] Mobile responsive design
