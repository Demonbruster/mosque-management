# TASK-011: Enhanced Public Financial Dashboard

**Epic:** Shariah-Compliant Financials (Manual Entry Phase)  
**Priority:** 🟠 P1 — High  
**Estimate:** 3 days  
**Labels:** `epic: financials`, `priority: high`, `type: frontend`  
**Assignee:** _TBD (Frontend Dev)_  
**Blocked by:** TASK-008  
**Blocks:** None

---

## 📋 Story

> **As a** mosque community member,  
> **I want** to view a public, read-only dashboard showing monthly income vs expenses breakdown by fund category,  
> **so that** I can trust how my donations are being managed (ISAK 35 transparency standard).

## ✅ Current Status

- ✅ Basic `PublicDashboard.tsx` component with ring chart and fund category cards
- ✅ Public API endpoint `GET /api/transactions/summary` (no auth required)
- ⬜ No monthly breakdown (only shows all-time totals)
- ⬜ No income vs expense separation
- ⬜ No date range filtering
- ⬜ No interactive charts (only static ring progress)

## 📝 Sub-Tasks

### Backend

- [ ] **ST-11.1** — Build `GET /api/transactions/summary/monthly?tenant_id=...&year=2026` — returns monthly income/expense breakdown by fund type
- [ ] **ST-11.2** — Build `GET /api/transactions/summary/trend?tenant_id=...&months=12` — returns 12-month trend data

### Frontend

- [ ] **ST-11.3** — Add month/year selector to filter dashboard data
- [ ] **ST-11.4** — Redesign with interactive bar chart (income vs expense per month) using a charting library (Recharts or Chart.js)
- [ ] **ST-11.5** — Add fund category pie chart with hover tooltips
- [ ] **ST-11.6** — Add "Income vs Expense" summary cards with percentage change from previous month
- [ ] **ST-11.7** — Add annual trend line chart showing 12-month financial trajectory
- [ ] **ST-11.8** — Make fully responsive (mobile-first design)
- [ ] **ST-11.9** — Add footer with last updated timestamp and ISAK-35 compliance badge

## 🧪 Acceptance Criteria

- [ ] Dashboard loads without authentication (public)
- [ ] Monthly breakdown shows income and expenses separately by fund
- [ ] Charts are interactive (hover for details)
- [ ] Mobile responsive — usable on congregation members' phones
- [ ] Only "Approved" transactions appear in the dashboard
