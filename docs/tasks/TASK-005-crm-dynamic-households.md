# TASK-005: CRM — Dynamic Households & Member Management

**Epic:** Relational CRM & Household Management  
**Priority:** 🟠 P1 — High  
**Estimate:** 5 days  
**Labels:** `epic: crm`, `priority: high`, `type: fullstack`  
**Assignee:** _TBD (Fullstack Dev)_  
**Blocked by:** TASK-003  
**Blocks:** TASK-006, TASK-007, TASK-012, TASK-013, TASK-014, TASK-015, TASK-016, TASK-025

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** to manage community members with their household relationships, including complex family structures like marriages, divorces, and dependents moving out,  
> **so that** I have an accurate, living directory of the entire congregation.

## ✅ Current Status

- ✅ `persons` table with full fields (name, contact, category, whatsapp opt-in)
- ✅ `households` table with address fields and mahalla zone
- ✅ `person_household_links` many-to-many table with role (Head/Spouse/Dependent)
- ✅ `person_relationships` table for family links
- ✅ Basic CRUD routes for `/api/persons` and `/api/households`
- ✅ Household link management API
- ✅ Relationship management API
- ✅ Frontend UI for member/household management
- ✅ Search/filter functionality
- ⬜ No bulk import capability

## 📝 Sub-Tasks

### Backend

- [x] **ST-5.1** — Build `POST/DELETE /api/person-household-links` to link/unlink persons from households (with start/end dates for history)
- [x] **ST-5.2** — Build `POST /api/person-relationships` to create family relationship links between two persons
- [x] **ST-5.3** — Build `GET /api/households/:id/members` — returns all persons linked to a household with their roles
- [x] **ST-5.4** — Build `GET /api/persons/:id/household-history` — returns all household links (current and historical) for a person
- [x] **ST-5.5** — Add search API `GET /api/persons/search?q=...` with full-text search on name, phone, email
- [x] **ST-5.6** — Add filter API `GET /api/persons?category=Member&mahalla=...` with pagination

### Frontend

- [x] **ST-5.7** — Build Members List page (`/members`): searchable, sortable table with category badges, pagination
- [x] **ST-5.8** — Build Member Detail page (`/members/:id`): profile card, household links, relationship graph, edit form
- [ ] **ST-5.9** — Build Add/Edit Member modal: form with all person fields + household assignment
- [x] **ST-5.10** — Build Households List page (`/households`): address cards with member counts
- [x] **ST-5.11** — Build Household Detail page (`/households/:id`): address info, linked members with roles, add/remove member actions
- [ ] **ST-5.12** — Add CSV bulk import for initial data migration

## 🧪 Acceptance Criteria

- [x] Admin can create a person and link them to a household with a role
- [x] Moving a person out of a household sets `end_date` (preserves history)
- [ ] Marriage merges two households by cross-linking persons
- [x] Search returns results within 300ms for 10,000+ records
- [x] All data is automatically scoped to the authenticated tenant
