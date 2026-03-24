# TASK-018: Audience Segmentation & Broadcasting

**Epic:** Omnichannel Communication Hub (WhatsApp)  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: whatsapp`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-017  
**Blocks:** None

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** to filter the congregation by zones, donor status, event attendance, and custom tags, then send targeted WhatsApp broadcasts to those segments,  
> **so that** messages are relevant and not spammy.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-18.1** — Create `person_tags` table: person_id, tag_name (e.g., "recurring_donor", "volunteer", "zone_a")
- [ ] **ST-18.2** — Build CRUD API for `/api/person-tags` (add/remove tags from persons)
- [ ] **ST-18.3** — Build `GET /api/persons/segment` — dynamic query builder accepting multiple filter criteria:
  - `mahalla_zone` (from households)
  - `category` (Member/Non-Member/Staff)
  - `tags[]` (any matching tag)
  - `whatsapp_opt_in = true` (mandatory for WhatsApp sends)
  - `has_donated_since` (date filter on transactions)
- [ ] **ST-18.4** — Create `broadcast_campaigns` table: name, segment_filter (JSON), template_id, status (Draft/Scheduled/Sending/Completed), scheduled_at, total/sent/delivered/failed counts
- [ ] **ST-18.5** — Build `POST /api/broadcasts` — creates a new campaign, previews audience count before confirming
- [ ] **ST-18.6** — Build `POST /api/broadcasts/:id/send` — triggers queued broadcast sending

### Frontend

- [ ] **ST-18.7** — Build Broadcast Campaign page (`/communications/broadcast`): create campaign wizard:
  1. Select segment filters (checkboxes, dropdowns)
  2. Preview audience count and sample members
  3. Select/compose message template
  4. Review & confirm send
- [ ] **ST-18.8** — Build Campaign History page: list of past campaigns with delivery metrics
- [ ] **ST-18.9** — Build Tag Manager page (`/admin/tags`): create/manage tags, bulk-tag persons

## 🧪 Acceptance Criteria

- [ ] Segment preview shows accurate count before sending
- [ ] Only WhatsApp opted-in members are included in broadcasts
- [ ] Campaign tracks delivery metrics in real-time
- [ ] Broadcast to 5000 contacts completes within 5 minutes via queue
