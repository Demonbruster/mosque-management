# TASK-022: Shared Team Inbox & Communication Analytics

**Epic:** Omnichannel Communication Hub (WhatsApp)  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: whatsapp`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-017  
**Blocks:** None

---

## 📋 Story

> **As a** mosque committee member,  
> **I want** a shared inbox where multiple staff can read and reply to incoming WhatsApp messages from the official mosque number, plus analytics on campaign performance,  
> **so that** no community message goes unanswered and we can measure engagement.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-22.1** — Create `inbox_conversations` table: person_id, last_message_at, assigned_to (staff person_id), status (Open/Resolved/Snoozed)
- [ ] **ST-22.2** — Build `GET /api/inbox` — list conversations with latest message preview, assignment status, unread count
- [ ] **ST-22.3** — Build `GET /api/inbox/:person_id/messages` — full message thread for a conversation
- [ ] **ST-22.4** — Build `POST /api/inbox/:person_id/reply` — send a WhatsApp reply (within 24h customer service window: free-form; outside: must use approved template)
- [ ] **ST-22.5** — Build `PATCH /api/inbox/:person_id/assign` — assign conversation to a staff member
- [ ] **ST-22.6** — Build `PATCH /api/inbox/:person_id/resolve` — mark conversation as resolved
- [ ] **ST-22.7** — Build `GET /api/analytics/communications` — campaign metrics:
  - Total messages sent/delivered/read/failed (rates)
  - Click-through rates on CTA buttons
  - Response rate (% of recipients who replied)
  - Top campaigns by engagement

### Frontend

- [ ] **ST-22.8** — Build Shared Inbox page (`/communications/inbox`): 
  - Left panel: conversation list (sorted by recency, unread first)
  - Right panel: message thread with reply box
  - Assignment dropdown per conversation
- [ ] **ST-22.9** — Build reply composer with 24h window indicator (show if free-form or template-only)
- [ ] **ST-22.10** — Build Communication Analytics dashboard (`/communications/analytics`):
  - Delivery rate chart
  - Read rate chart  
  - Campaign comparison table
  - CTA click-through rates

## 🧪 Acceptance Criteria

- [ ] Multiple staff members can view the same inbox simultaneously
- [ ] Conversation assignment prevents duplicate replies
- [ ] 24h window detection correctly enforces template-only replies after window
- [ ] Analytics show real-time delivery/read rates per campaign
- [ ] Resolved conversations can be reopened if new message arrives
