# TASK-012: Fixed Asset Management

**Epic:** Mosque Operations & Asset Management  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: operations`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-005  
**Blocks:** TASK-013

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** a centralized digital inventory of all mosque property and equipment with maintenance tracking,  
> **so that** I can track the lifecycle, warranties, and fund source of every mosque asset.

## ✅ Current Status

- ✅ `fixed_assets` table exists with name, description, fund_source, purchase_price, current_value, acquisition_date
- ⬜ No condition tracking field
- ⬜ No warranty/AMC tracking
- ⬜ No maintenance reminders
- ⬜ No disposal workflow
- ⬜ No CRUD API or UI

## 📝 Sub-Tasks

### Backend

- [ ] **ST-12.1** — Add columns to `fixed_assets`: `condition` (enum: Excellent/Good/Fair/Poor), `warranty_expiry`, `amc_expiry`, `amc_vendor`, `disposal_date`, `disposal_method`, `unique_asset_id` (auto-generated)
- [ ] **ST-12.2** — Build full CRUD API for `/api/assets` (list, get, create, update, soft-delete)
- [ ] **ST-12.3** — Build `GET /api/assets/maintenance-due` — returns assets with AMC/warranty expiring within 30 days
- [ ] **ST-12.4** — Build `POST /api/assets/:id/dispose` — marks asset as disposed with method and reason

### Frontend

- [ ] **ST-12.5** — Build Assets List page (`/assets`): searchable table with condition badges, filter by fund source
- [ ] **ST-12.6** — Build Asset Detail page (`/assets/:id`): full info card with maintenance timeline
- [ ] **ST-12.7** — Build Add/Edit Asset form with all fields
- [ ] **ST-12.8** — Build Maintenance Alerts widget on admin dashboard: list of assets needing attention

## 🧪 Acceptance Criteria

- [ ] Each asset has a unique auto-generated ID
- [ ] Assets track whether purchased with mosque funds or donated
- [ ] Admin gets alerts for assets with expiring warranties/AMCs
- [ ] Disposal workflow marks asset inactive with full audit trail
