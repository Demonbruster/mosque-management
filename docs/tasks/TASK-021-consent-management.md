# TASK-021: Consent Management (Opt-In / Opt-Out)

**Epic:** Omnichannel Communication Hub (WhatsApp)  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 2 days  
**Labels:** `epic: whatsapp`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-017  
**Blocks:** None

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** the system to strictly track WhatsApp opt-in consent with timestamps and automatically process opt-out commands ("STOP"),  
> **so that** we comply with GDPR, Meta's messaging policies, and avoid getting our WhatsApp number reported as spam.

## ✅ Current Status

- ✅ `whatsapp_opt_in` boolean field on `persons` table
- ⬜ No opt-in timestamp or source tracking
- ⬜ No automated opt-out processing
- ⬜ No consent audit log

## 📝 Sub-Tasks

### Backend

- [ ] **ST-21.1** — Add `opt_in_date`, `opt_in_source` (self_service/registration/admin_import), `opt_out_date` columns to `persons`
- [ ] **ST-21.2** — Build automated opt-out handler: when incoming message contains "STOP", "UNSUBSCRIBE", "OPT OUT" → set `whatsapp_opt_in = false`, record opt_out_date, send confirmation message
- [ ] **ST-21.3** — Enforce opt-in check: all broadcast/send endpoints must verify `whatsapp_opt_in = true` before sending, skip opted-out contacts
- [ ] **ST-21.4** — Create `consent_audit_log` table: person_id, action (opt_in/opt_out), source, timestamp
- [ ] **ST-21.5** — Build `GET /api/admin/consent-report` — summary of opt-in vs opt-out rates

### Frontend

- [ ] **ST-21.6** — Add opt-in/opt-out status badge on member profile
- [ ] **ST-21.7** — Admin can manually toggle opt-in/opt-out (with reason logging)
- [ ] **ST-21.8** — Add consent rate widget to communications dashboard

## 🧪 Acceptance Criteria

- [ ] "STOP" reply immediately opts out the user and sends confirmation
- [ ] Opted-out users are automatically excluded from all broadcasts
- [ ] Every opt-in/opt-out action is logged with timestamp and source
- [ ] Admin can see consent report with opt-in percentage trends
