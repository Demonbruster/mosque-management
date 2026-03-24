# TASK-015: Life Events Registry & Administrative Documentation

**Epic:** Mosque Operations & Asset Management  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: operations`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-005  
**Blocks:** None

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** to digitally register marriages, divorces, deaths, and other life events, and generate official certificates (Marriage Certificate, NOC, Clearance Certificate, Death Certificate),  
> **so that** our Mahalla has an official, searchable registry of all community life events.

## ✅ Current Status

- ✅ `life_event_records` table with event_type (Marriage/Divorce/Death/Birth/Conversion), person_a/b, date, certificate_no, location
- ⬜ No CRUD API or UI
- ⬜ No certificate generation
- ⬜ No NOC or Clearance Certificate support

## 📝 Sub-Tasks

### Backend

- [ ] **ST-15.1** — Build CRUD API for `/api/life-events` (list, get, create, update)
- [ ] **ST-15.2** — Add `document_urls` JSON column for storing scanned document references
- [ ] **ST-15.3** — Build `GET /api/life-events/:id/certificate` — generates PDF certificate based on event type:
  - Marriage Certificate (Nikahnama details)
  - Death Certificate (burial details, cause)
  - NOC (for marriages at other mosques)
  - Clearance Certificate (for member relocation)
- [ ] **ST-15.4** — Auto-generate sequential certificate numbers per event type per tenant
- [ ] **ST-15.5** — When registering a Marriage → auto-create spouse relationship in `person_relationships`
- [ ] **ST-15.6** — When registering a Death → auto-set person `is_active = false`

### Frontend

- [ ] **ST-15.7** — Build Life Events List page (`/life-events`): filterable by event type, date range
- [ ] **ST-15.8** — Build Event Registration form with dynamic fields based on event type:
  - Marriage: bride/groom (person search), witnesses, Mahr amount
  - Death: burial location, cause, Janazah details
  - NOC: destination mosque details
- [ ] **ST-15.9** — Build Certificate Preview & Download page with print-friendly layout
- [ ] **ST-15.10** — Build quick search: find all events for a person

## 🧪 Acceptance Criteria

- [ ] Marriage registration auto-links spouses in relationships table
- [ ] Death registration deactivates the person record
- [ ] Certificates generate with proper formatting and mosque letterhead
- [ ] Certificate numbers are unique and sequential
- [ ] NOC generates with destination mosque details and member clearance status
