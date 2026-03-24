# TASK-017: WhatsApp Business API Infrastructure

**Epic:** Omnichannel Communication Hub (WhatsApp)  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 5 days  
**Labels:** `epic: whatsapp`, `priority: medium`, `type: backend`  
**Assignee:** _TBD (Backend Dev)_  
**Blocked by:** TASK-003  
**Blocks:** TASK-018, TASK-019, TASK-020, TASK-021, TASK-022

---

## 📋 Story

> **As a** mosque communications manager,  
> **I want** a reliable, ban-proof WhatsApp messaging infrastructure using the official Business API (via Twilio),  
> **so that** I can send thousands of messages to the congregation without risking account bans.

## ✅ Current Status

- ✅ `lib/twilio.ts` with basic message send function
- ✅ `/api/whatsapp` route with send endpoint
- ✅ `communication_logs` table with delivery tracking fields
- ⬜ No webhook for delivery status updates
- ⬜ No incoming message handling
- ⬜ No rate limiting or queue management
- ⬜ No message retry logic

## 📝 Sub-Tasks

### Backend

- [ ] **ST-17.1** — Build `POST /api/whatsapp/webhook` — Twilio webhook handler for delivery status callbacks (Sent → Delivered → Read → Failed)
- [ ] **ST-17.2** — Build `POST /api/whatsapp/incoming` — Twilio webhook for incoming messages (store in communication_logs)
- [ ] **ST-17.3** — Implement message queue with rate limiting (respect Twilio rate limits: ~80 msgs/sec for Business API)
- [ ] **ST-17.4** — Implement retry logic for failed messages (max 3 retries with exponential backoff)
- [ ] **ST-17.5** — Build `POST /api/whatsapp/broadcast` — send a message to a list of person IDs (queued, not synchronous)
- [ ] **ST-17.6** — Build `GET /api/whatsapp/logs` — list communication logs with filters (status, date range, person)
- [ ] **ST-17.7** — Add Twilio webhook signature verification middleware for security

### Frontend

- [ ] **ST-17.8** — Build Message Logs page (`/communications/logs`): searchable table with delivery status, person name, date
- [ ] **ST-17.9** — Add message delivery status indicators (Sent ✓, Delivered ✓✓, Read 🔵, Failed ❌)

## 🧪 Acceptance Criteria

- [ ] Delivery status webhooks update communication_logs in real-time
- [ ] Incoming messages are stored and queryable
- [ ] Broadcast to 1000+ contacts completes without timeout (queued processing)
- [ ] Failed messages retry automatically up to 3 times
- [ ] Webhook endpoints verify Twilio signatures
