# TASK-003: Firebase Authentication & RBAC Matrix

**Epic:** Multi-Tenant Infrastructure & Security  
**Priority:** 🔴 P0 — Critical  
**Estimate:** 5 days  
**Labels:** `epic: infrastructure`, `priority: critical`, `type: fullstack`  
**Assignee:** _TBD (Fullstack Dev)_  
**Blocked by:** TASK-001, TASK-002  
**Blocks:** TASK-004, TASK-005, TASK-008, TASK-017, TASK-023, TASK-024

---

## 📋 Story

> **As a** mosque administrator,  
> **I want** role-based access control so that devotees only see their own data, treasurers can only create transactions, and admins have full access,  
> **so that** data is secure and each user only sees what they're authorized to see.

## ✅ Current Status

- ✅ Firebase Auth initialized in frontend (`lib/firebase.ts`)
- ✅ `firebaseAuth()` middleware verifies JWT tokens on backend
- ✅ `requireRole()` middleware checks custom claims (`admin`, `imam`, `treasurer`, `member`)
- ✅ `<ProtectedRoute>` component in frontend
- ✅ Login page with email/password
- ⬜ No user registration flow (admin invites only)
- ⬜ No admin panel to manage users/roles
- ⬜ No script to set custom claims programmatically (only manual snippet in README)
- ⬜ No role display in UI or navigation changes based on role
- ⬜ No audit log for role changes

## 📝 Sub-Tasks

- [ ] **ST-3.1** — Build `POST /api/admin/users/invite` endpoint: admin creates a Firebase user → sets custom claims (role + tenant_id) → returns temp password or invite link
- [ ] **ST-3.2** — Build `GET /api/admin/users` endpoint: list all users for the tenant with their roles
- [ ] **ST-3.3** — Build `PATCH /api/admin/users/:uid/role` endpoint: update a user's role (admin only)
- [ ] **ST-3.4** — Build frontend Admin Users page (`/admin/users`): table of users, invite form, role dropdown
- [ ] **ST-3.5** — Update `<Layout>` navigation to show/hide menu items based on user role
- [ ] **ST-3.6** — Build `<ProtectedRoute>` fallback: unauthorized page with "You don't have access" message
- [ ] **ST-3.7** — Create `scripts/set-user-role.ts` CLI tool to set custom claims (dev utility)
- [ ] **ST-3.8** — Add audit log table (`system_audit_logs`) and middleware to log role changes and sensitive operations
- [ ] **ST-3.9** — Write tests for auth middleware edge cases (expired token, missing claims, wrong tenant)

## RBAC Matrix Reference

| Permission | `admin` | `imam` | `treasurer` | `member` |
|---|:---:|:---:|:---:|:---:|
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| CRUD persons/households | ✅ | ✅ | ❌ | ❌ |
| Create transactions (Maker) | ✅ | ✅ | ✅ | ❌ |
| Approve/Reject transactions | ✅ | ✅ | ❌ | ❌ |
| View all financial data | ✅ | ✅ | ✅ | ❌ |
| View own profile/data | ✅ | ✅ | ✅ | ✅ |
| View public dashboard | ✅ | ✅ | ✅ | ✅ |

## 🧪 Acceptance Criteria

- [ ] Admin can invite a new user and assign a role
- [ ] Non-admin users cannot access `/admin/*` routes
- [ ] Navigation menu dynamically adapts based on logged-in role
- [ ] Role changes are logged in audit table
- [ ] Expired/invalid tokens return 401, wrong role returns 403
