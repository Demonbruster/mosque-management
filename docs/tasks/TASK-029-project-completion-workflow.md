# TASK-029: Project Completion & Closure Workflow

**Epic:** Strategic Project Roadmap Planner  
**Priority:** 🟢 P3 — Low  
**Estimate:** 2 days  
**Labels:** `epic: roadmap`, `priority: low`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-028  
**Blocks:** None

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** a formal project closure process that verifies all financials, documents any delays, and archives the comprehensive project record,  
> **so that** completed projects have full accountability and transparency for future reference.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-29.1** — Add `closure_date`, `closure_notes`, `delay_reason`, `final_cost` columns to `project_roadmap`
- [ ] **ST-29.2** — Build `POST /api/projects/:id/close` — closure workflow:
  1. Verify all linked transactions are Approved (no Pending transactions)
  2. Calculate final cost from all linked Approved transactions
  3. Set phase = "Past", record closure_date
  4. Return closure summary
- [ ] **ST-29.3** — Build `GET /api/projects/:id/closure-report` — generates comprehensive PDF: project details, milestones, all transactions, timeline, delays, final cost vs budget

### Frontend

- [ ] **ST-29.4** — Build Closure Wizard modal:
  1. Step 1: Financial verification (show pending transactions if any — block closure)
  2. Step 2: Document delays and notes
  3. Step 3: Confirm closure
- [ ] **ST-29.5** — Build Closure Report preview and download (PDF)
- [ ] **ST-29.6** — Auto-move closed projects to "Past" section on public roadmap

## 🧪 Acceptance Criteria

- [ ] Cannot close a project with pending (unapproved) transactions
- [ ] Final cost is auto-calculated from all linked Approved transactions
- [ ] Closure report PDF includes full project history
- [ ] Closed projects auto-appear in "Past" section of public roadmap
- [ ] Closure cannot be reversed (permanent action with confirmation)
