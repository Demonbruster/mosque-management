# TASK-016: Meeting & Dispute (Panchayath) Management

**Epic:** Mosque Operations & Asset Management  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 3 days  
**Labels:** `epic: operations`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-005  
**Blocks:** None

---

## 📋 Story

> **As a** committee secretary,  
> **I want** to record meeting minutes that auto-lock after the next meeting's minutes are entered, and track community dispute resolutions (Panchayath),  
> **so that** governance records are tamper-proof and disputes are transparently documented.

## ✅ Current Status

- ✅ `meeting_logs` table with meeting_type (Jamath/Management/Panchayath), date, title, minutes_text, attendees_count, is_locked
- ⬜ No auto-lock mechanism
- ⬜ No CRUD API or UI
- ⬜ No Panchayath tracking workflow

## 📝 Sub-Tasks

### Backend

- [ ] **ST-16.1** — Build CRUD API for `/api/meetings` (list, get, create, update)
- [ ] **ST-16.2** — Implement auto-lock: when a new meeting of the same type is created → the previous meeting's `is_locked = true` and becomes read-only
- [ ] **ST-16.3** — Prevent updates to locked meetings (return 403 with "Meeting minutes are locked")
- [ ] **ST-16.4** — Create `panchayath_cases` table: case_id, complainant_id, respondent_id, subject, status (Open/In_Progress/Resolved/Dismissed), resolution_notes
- [ ] **ST-16.5** — Create `panchayath_sessions` table: case_id, session_date, notes, next_steps
- [ ] **ST-16.6** — Build CRUD API for `/api/panchayath` (cases + sessions)

### Frontend

- [ ] **ST-16.7** — Build Meeting Minutes page (`/meetings`): list with type filter, locked status indicator
- [ ] **ST-16.8** — Build Meeting Detail page: rich text editor for minutes, attendees count, lock indicator
- [ ] **ST-16.9** — Build Panchayath Cases page (`/panchayath`): case list with status badges
- [ ] **ST-16.10** — Build Case Detail page: timeline of counselling sessions, add session notes, resolve/dismiss actions

## 🧪 Acceptance Criteria

- [ ] Creating a new Management meeting auto-locks the previous Management meeting
- [ ] Locked meetings cannot be edited (UI disables editing, API rejects updates)
- [ ] Panchayath cases track full lifecycle: application → sessions → resolution
- [ ] Resolution notes are permanently recorded and visible
