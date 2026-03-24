# TASK-020: Automated Workflows & Chatbots

**Epic:** Omnichannel Communication Hub (WhatsApp)  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: whatsapp`, `priority: medium`, `type: backend`  
**Assignee:** _TBD_  
**Blocked by:** TASK-017, TASK-019  
**Blocks:** None

---

## 📋 Story

> **As a** mosque,  
> **I want** automated WhatsApp flows — like a "Donation Concierge" that responds to donation keywords, and volunteer shift reminders with confirmation replies,  
> **so that** staff workload is reduced and the congregation gets instant, 24/7 responses.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-20.1** — Create `automation_flows` table: tenant_id, flow_name, trigger_type (keyword/schedule), trigger_value, flow_steps (JSON), is_active
- [ ] **ST-20.2** — Build keyword-triggered flow engine:
  - Incoming message matches keyword (e.g., "DONATE", "ZAKAT")
  - System sends pre-defined response sequence from flow_steps
  - Tracks conversation state per person
- [ ] **ST-20.3** — Build "Donation Concierge" flow:
  1. Keyword "DONATE" → Thank you message + fund selection menu
  2. User selects fund → Send payment link for that fund
  3. After payment → Send confirmation + receipt
- [ ] **ST-20.4** — Build scheduled trigger engine: send messages at specified times (e.g., 24h before volunteer shift)
- [ ] **ST-20.5** — Build reply parser: handle structured replies ("Reply 1 to confirm, 2 for help") and route accordingly
- [ ] **ST-20.6** — Build human-handoff trigger: if bot can't handle a reply → route to shared inbox (TASK-022) with context
- [ ] **ST-20.7** — Build CRUD API for `/api/automations` (list, get, create, update, toggle active)

### Frontend

- [ ] **ST-20.8** — Build Automation Flows page (`/communications/automations`): list of flows with active/inactive toggle
- [ ] **ST-20.9** — Build Visual Flow Builder: drag-and-drop steps (message → wait → branch → handoff)
- [ ] **ST-20.10** — Build flow testing tool: simulate a conversation with the bot

## 🧪 Acceptance Criteria

- [ ] "DONATE" keyword triggers the donation concierge flow
- [ ] Volunteer reminders send 24h before scheduled shifts
- [ ] Structured replies (1/2/3) are correctly parsed and routed
- [ ] Unrecognized replies trigger human handoff
- [ ] Flows can be enabled/disabled without code changes
