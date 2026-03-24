# TASK-028: Project Financial Tracking & Analytics

**Epic:** Strategic Project Roadmap Planner  
**Priority:** 🟢 P3 — Low  
**Estimate:** 3 days  
**Labels:** `epic: roadmap`, `priority: low`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-027  
**Blocks:** TASK-029

---

## 📋 Story

> **As a** mosque treasurer,  
> **I want** to track all receipts and payments tied to specific projects, and generate analytical reports on cost deviations and fund utilization,  
> **so that** project spending is transparent and management can make informed decisions.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-28.1** — Add `project_id` column to `transactions` table (optional FK to project_roadmap)
- [ ] **ST-28.2** — Build `GET /api/projects/:id/financial-summary` — total receipts, total payments, balance, budget utilization %
- [ ] **ST-28.3** — Build `GET /api/projects/:id/transactions` — list all transactions linked to this project
- [ ] **ST-28.4** — Build `GET /api/reports/project-analysis` — cross-project comparison: budget vs actual, cost deviation

### Frontend

- [ ] **ST-28.5** — Build Project Financial tab on project detail page: receipts vs payments chart, budget gauge
- [ ] **ST-28.6** — Link transactions to projects during creation (optional project dropdown in transaction form)
- [ ] **ST-28.7** — Build Project Analysis Report page: bar charts comparing budget vs actual across projects

## 🧪 Acceptance Criteria

- [ ] Transactions can be optionally linked to a specific project
- [ ] Project financial summary shows budget utilization percentage
- [ ] Cost deviation report highlights over-budget projects
- [ ] Only Approved transactions count toward project financials
