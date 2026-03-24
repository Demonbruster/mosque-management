# TASK-008: Manual Entry Dashboard (Financial ERP)

**Epic:** Shariah-Compliant Financials (Manual Entry Phase)  
**Priority:** 🟠 P1 — High  
**Estimate:** 5 days  
**Labels:** `epic: financials`, `priority: high`, `type: fullstack`  
**Assignee:** _TBD (Fullstack Dev)_  
**Blocked by:** TASK-003  
**Blocks:** TASK-009, TASK-010, TASK-011, TASK-026

---

## 📋 Story

> **As a** mosque staff member (treasurer or admin),  
> **I want** a form to manually log incoming donations (cash/cheque) and outgoing expenses, with mandatory Shariah-compliant fund tagging,  
> **so that** every financial entry is properly categorized and traceable.

## ✅ Current Status

- ✅ `transactions` table with amount, payment_method, status, fund_id FK
- ✅ `fund_categories` table with Shariah fund types (ZAKAT, SADAQAH, WAQF, etc.)
- ✅ Basic CRUD API for `/api/transactions` with create + approve/reject
- ⬜ No separate income vs expense types
- ⬜ No frontend form for manual entry
- ⬜ No fund category management UI
- ⬜ No validation rules enforcement

## 📝 Sub-Tasks

### Backend

- [ ] **ST-8.1** — Add `type` enum column to `transactions` table: `Income` vs `Expense`
- [ ] **ST-8.2** — Build `GET /api/fund-categories` — list active fund categories for the tenant
- [ ] **ST-8.3** — Build `POST /api/fund-categories` — admin creates new fund categories
- [ ] **ST-8.4** — Add validation: `fund_id` is **required** and must be an active category (reject if not tagged)
- [ ] **ST-8.5** — Add `entered_by_name` field to response for audit trail display

### Frontend

- [ ] **ST-8.6** — Build Transaction Entry form (`/finance/new`): 
  - Income/Expense toggle
  - Amount input (required)
  - Fund category dropdown (required, filtered by type)
  - Payment method selector (Cash / Google Pay / Bank Transfer / UPI / Cheque)
  - Donor/payee lookup (searchable persons dropdown for Income)
  - Description, reference number, notes
  - Date picker (defaults to today)
- [ ] **ST-8.7** — Build Transactions List page (`/finance`): filterable table with status badges (Pending/Approved/Rejected), date range filter, fund filter, export to CSV
- [ ] **ST-8.8** — Build Fund Categories management page (`/admin/fund-categories`): CRUD for fund types
- [ ] **ST-8.9** — Add validation: prevent saving without fund category selection (red warning message)

## 🧪 Acceptance Criteria

- [ ] Staff cannot save a transaction without selecting a fund category (Shariah compliance)
- [ ] Income and expense are tracked separately
- [ ] Transactions list shows who entered each record and when
- [ ] Fund category dropdown only shows active categories for the tenant
- [ ] All entries default to "Pending" status
