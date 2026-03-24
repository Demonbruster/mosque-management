# TASK-019: WhatsApp Template Management & Interactive Messaging

**Epic:** Omnichannel Communication Hub (WhatsApp)  
**Priority:** 🟡 P2 — Medium  
**Estimate:** 3 days  
**Labels:** `epic: whatsapp`, `priority: medium`, `type: fullstack`  
**Assignee:** _TBD_  
**Blocked by:** TASK-017  
**Blocks:** TASK-020

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** to create, manage, and submit WhatsApp message templates (required by Meta for business-initiated messages), with dynamic variables like {{First Name}} and CTA buttons like "Donate Now",  
> **so that** our templates are approved by Meta and our messages drive congregation action.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-19.1** — Create `message_templates` table: tenant_id, template_name, template_body, header_text, footer_text, variables (JSON), cta_buttons (JSON), category (MARKETING/UTILITY/AUTHENTICATION), approval_status (Draft/Submitted/Approved/Rejected), meta_template_id
- [ ] **ST-19.2** — Build CRUD API for `/api/templates` (list, get, create, update, delete)
- [ ] **ST-19.3** — Build `POST /api/templates/:id/submit` — submits template to Twilio/Meta for approval (tracks approval status)
- [ ] **ST-19.4** — Build template variable resolver: given a template + person_id, replaces {{first_name}}, {{donation_amount}}, etc. with actual values
- [ ] **ST-19.5** — Build webhook to receive template approval/rejection callbacks from Twilio

### Frontend

- [ ] **ST-19.6** — Build Template Editor page (`/communications/templates`): 
  - Visual template builder with header, body, footer sections
  - Variable insertion buttons ({{first_name}}, {{amount}}, etc.)
  - CTA button configurator (button text + URL)
  - Live preview panel showing rendered template
- [ ] **ST-19.7** — Show template approval status badges (Draft → Submitted → Approved/Rejected)
- [ ] **ST-19.8** — Template picker in broadcast workflow (only show Approved templates)

## 🧪 Acceptance Criteria

- [ ] Templates support dynamic variable insertion
- [ ] CTA buttons render correctly in WhatsApp preview
- [ ] Only Meta-approved templates can be used for broadcasts
- [ ] Template submission triggers Twilio API call
- [ ] Rejected templates show rejection reason from Meta
