# TASK-014: Utensil & Equipment Rentals

**Epic:** Mosque Operations & Asset Management  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 3 days  
**Labels:** `epic: operations`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-005  
**Blocks:** None

---

## 📋 Story

> **As a** mosque front-desk volunteer,  
> **I want** to issue cooking utensils or event materials to community members, track returns, and automatically calculate penalties for damaged/missing items,  
> **so that** inventory is managed and losses are accounted for.

## ✅ Current Status

- ✅ `utensil_inventory` table with item_name, stock_quantity, rental_price
- ✅ `utensil_rentals` table with customer_id, utensil_id, quantity, issue/return dates, penalty_fee
- ⬜ No guarantor tracking
- ⬜ No CRUD API or UI
- ⬜ No auto-penalty calculation
- ⬜ No voucher generation

## 📝 Sub-Tasks

### Backend

- [ ] **ST-14.1** — Add `guarantor_id` column to `utensil_rentals` (FK to persons — required for non-member issuance)
- [ ] **ST-14.2** — Build CRUD API for `/api/utensils` (inventory management)
- [ ] **ST-14.3** — Build `POST /api/utensil-rentals/issue` — creates a rental record, decrements stock
- [ ] **ST-14.4** — Build `POST /api/utensil-rentals/:id/return` — processes return with damage assessment, auto-calculates penalty, increments stock
- [ ] **ST-14.5** — Build `GET /api/utensil-rentals/outstanding` — lists all unreturned items
- [ ] **ST-14.6** — Build `GET /api/utensil-rentals/:id/voucher` — generates issue/return voucher (PDF or printable HTML)

### Frontend

- [ ] **ST-14.7** — Build Utensil Inventory page (`/utensils`): stock list with available quantities
- [ ] **ST-14.8** — Build Issue form: select utensils, quantity, borrower (person search), guarantor (if non-member)
- [ ] **ST-14.9** — Build Return form: mark items returned, indicate damage, auto-show penalty calculation
- [ ] **ST-14.10** — Build Outstanding Rentals dashboard: overdue items with borrower and guarantor contact

## 🧪 Acceptance Criteria

- [ ] Stock decrements on issue, increments on return
- [ ] Non-member issuance requires a registered member as guarantor
- [ ] Penalty is auto-calculated based on damage/missing items
- [ ] Issue/return voucher can be printed
- [ ] Admin can view all outstanding (unreturned) items
