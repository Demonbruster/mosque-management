# TASK-007: Data Deduplication Engine

**Epic:** Relational CRM & Household Management  
**Priority:** 🟠 P1 — High  
**Estimate:** 3 days  
**Labels:** `epic: crm`, `priority: high`, `type: backend`  
**Assignee:** _TBD (Backend Dev)_  
**Blocked by:** TASK-005  
**Blocks:** None

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** the system to detect potential duplicate member records and let me merge them,  
> **so that** the congregation directory stays clean and accurate after bulk imports or manual entry errors.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-7.1** — Build dedup detection job `POST /api/admin/dedup/scan` — runs matching algorithms and returns candidate pairs with match scores
- [ ] **ST-7.2** — Implement **strict matching** (unsupervised): exact match on phone number OR (first_name + last_name + dob)
- [ ] **ST-7.3** — Implement **broad matching** (supervised): fuzzy match on name similarity (Levenshtein distance ≤ 2) + same mahalla zone
- [ ] **ST-7.4** — Build `GET /api/admin/dedup/candidates` — returns list of potential duplicate pairs with scores
- [ ] **ST-7.5** — Build `POST /api/admin/dedup/merge` — merges two person records: keeps primary, transfers household links / transactions / relationships from secondary, soft-deletes secondary
- [ ] **ST-7.6** — Build `POST /api/admin/dedup/dismiss` — marks a pair as "not duplicates" to exclude from future scans

### Frontend

- [ ] **ST-7.7** — Build Dedup Review page (`/admin/dedup`): side-by-side comparison of candidate pairs with merge/dismiss buttons
- [ ] **ST-7.8** — Merge confirmation modal showing what data will be transferred

## 🧪 Acceptance Criteria

- [ ] Strict matching correctly identifies exact phone duplicates
- [ ] Fuzzy matching catches "Mohammad" vs "Mohammed" variations
- [ ] Merging transfers all related records (household links, transactions, relationships) to the primary record
- [ ] Dismissed pairs don't reappear in future scans
- [ ] Audit log records all merge operations
