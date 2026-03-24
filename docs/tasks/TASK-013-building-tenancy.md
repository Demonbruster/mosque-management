# TASK-013: Building & Tenancy Management

**Epic:** Mosque Operations & Asset Management  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: operations`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-005, TASK-012  
**Blocks:** None

---

## 📋 Story

> **As a** mosque property manager,  
> **I want** to manage tenancy agreements, track rent payments, and handle security deposits for mosque-owned commercial properties,  
> **so that** rental income is properly documented and tenants are managed efficiently.

## ✅ Current Status

- ✅ `tenancy_agreements` table with person_id, asset_id, rent_amount, security_deposit, status
- ⬜ No rent payment tracking table
- ⬜ No CRUD API or UI
- ⬜ No rent due reports
- ⬜ No security deposit balance sheet integration

## 📝 Sub-Tasks

### Backend

- [ ] **ST-13.1** — Create `rent_payments` table: tenant_agreement_id, amount, payment_date, payment_method, month, year
- [ ] **ST-13.2** — Build full CRUD API for `/api/tenancy-agreements`
- [ ] **ST-13.3** — Build `POST /api/tenancy-agreements/:id/rent-payment` — record monthly rent payment
- [ ] **ST-13.4** — Build `GET /api/tenancy-agreements/rent-due` — returns overdue rent across all agreements
- [ ] **ST-13.5** — Build `POST /api/tenancy-agreements/:id/terminate` — terminates agreement, calculates deposit refund/deductions
- [ ] **ST-13.6** — Build rent analysis report API: `GET /api/reports/rent-analysis?year=2026`

### Frontend

- [ ] **ST-13.7** — Build Tenancy List page (`/tenancy`): agreements with status badges, tenant name, property
- [ ] **ST-13.8** — Build Tenancy Detail page: agreement info, rent payment history, record payment button
- [ ] **ST-13.9** — Build "Create Agreement" form: link to asset, link to person, set terms
- [ ] **ST-13.10** — Build Rent Due report page showing overdue payments with tenant contact info
- [ ] **ST-13.11** — Build Termination workflow modal: deposit refund calculator

## 🧪 Acceptance Criteria

- [ ] Agreement links a person (tenant) to a fixed asset (property)
- [ ] Monthly rent tracking shows paid/overdue status
- [ ] Rent Due report highlights all overdue payments
- [ ] Termination calculates security deposit refund after deductions
- [ ] Rent discounts can be applied with admin approval
