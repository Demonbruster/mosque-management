# TASK-009: Maker-Checker Dual Authorization Workflow

**Epic:** Shariah-Compliant Financials (Manual Entry Phase)  
**Priority:** 🟠 P1 — High  
**Estimate:** 3 days  
**Labels:** `epic: financials`, `priority: high`, `type: fullstack`  
**Assignee:** _TBD (Fullstack Dev)_  
**Blocked by:** TASK-008  
**Blocks:** TASK-010

---

## 📋 Story

> **As a** mosque treasurer (the "Checker"),  
> **I want** to see all transactions entered by staff (the "Makers") in a pending queue and verify them against physical cash/cheques before approving,  
> **so that** no financial entry goes into the books without dual authorization, preventing errors and fraud.

## ✅ Current Status

- ✅ `status` field on transactions: Pending / Approved / Rejected
- ✅ `PATCH /api/transactions/:id/approve` and `/reject` endpoints with role protection
- ⬜ No "Checker" dashboard UI
- ⬜ No prevention of same-person approve (maker ≠ checker)
- ⬜ No approval notes/reason field
- ⬜ No notification to the maker when approved/rejected

## 📝 Sub-Tasks

### Backend

- [ ] **ST-9.1** — Add `approved_by` and `approved_at` columns to `transactions` table
- [ ] **ST-9.2** — Add `rejection_reason` column to `transactions` table
- [ ] **ST-9.3** — Enforce maker ≠ checker rule: the user who created the transaction (`admin_id`) cannot approve it (return 400 error)
- [ ] **ST-9.4** — Build `GET /api/transactions/pending` — returns only Pending transactions for the checker queue
- [ ] **ST-9.5** — Update approve/reject endpoints to record `approved_by`, `approved_at`, and `rejection_reason`

### Frontend

- [ ] **ST-9.6** — Build Approval Queue page (`/finance/approvals`): list of pending transactions with approve/reject buttons
- [ ] **ST-9.7** — Approval detail modal: shows full transaction data, maker info, amount, fund type; approve button + reject with reason text area
- [ ] **ST-9.8** — Add status badge indicators across transaction views (Pending=yellow, Approved=green, Rejected=red)
- [ ] **ST-9.9** — Show toast notifications: "Transaction approved" / "Transaction rejected"

## 🧪 Acceptance Criteria

- [ ] Treasurer creates a transaction → appears in checker queue as "Pending"
- [ ] Admin (different user) can approve → status changes to "Approved" with timestamp
- [ ] Same user who created cannot approve their own transaction
- [ ] Rejected transactions show the reason visible to the original maker
- [ ] Only "Approved" transactions count toward financial reports
