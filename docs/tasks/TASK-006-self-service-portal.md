# TASK-006: Self-Service Member Portal

**Epic:** Relational CRM & Household Management  
**Priority:** 🟠 P1 — High  
**Estimate:** 5 days  
**Labels:** `epic: crm`, `priority: high`, `type: frontend`  
**Assignee:** _TBD (Frontend Dev)_  
**Blocked by:** TASK-005  
**Blocks:** None

---

## 📋 Story

> **As a** mosque community member,  
> **I want** to log in, view my profile and household information, and submit update requests (e.g., change phone number, update address),  
> **so that** I can manage my own data without visiting the mosque office.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-6.1** — Build `GET /api/me` — returns the authenticated member's person record, household links, and relationships
- [ ] **ST-6.2** — Build `POST /api/me/update-request` — member submits an update request (e.g., new phone number) which goes into a pending queue for admin approval
- [ ] **ST-6.3** — Build `GET /api/admin/update-requests` — admin views pending member update requests
- [ ] **ST-6.4** — Build `PATCH /api/admin/update-requests/:id/approve` and `/reject`

### Frontend

- [ ] **ST-6.5** — Build Member Profile page (`/my-profile`): read-only view of own person data + household info
- [ ] **ST-6.6** — Build "Request Update" form: fields for what they want to change, with current vs. requested values
- [ ] **ST-6.7** — Build Admin Update Requests queue page (`/admin/update-requests`): list of pending requests with approve/reject actions, diff view of changes
- [ ] **ST-6.8** — Add notification toast when a member's update request is approved or rejected

## 🧪 Acceptance Criteria

- [ ] Member role user can see only their own profile data
- [ ] Member can submit a phone/address/name change request
- [ ] Admin sees pending requests and can approve (auto-updates person record) or reject (with reason)
- [ ] Member cannot directly edit their own record — must go through approval flow
