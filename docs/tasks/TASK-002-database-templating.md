# TASK-002: Multi-Tenant Database Templating (Neon PostgreSQL)

**Epic:** Multi-Tenant Infrastructure & Security  
**Priority:** 🔴 P0 — Critical  
**Estimate:** 3 days  
**Labels:** `epic: infrastructure`, `priority: critical`, `type: backend`  
**Assignee:** _TBD (Backend Dev)_  
**Blocked by:** TASK-001  
**Blocks:** TASK-003, TASK-005, TASK-008

---

## 📋 Story

> **As a** platform operator,  
> **I want** each mosque (tenant) to have strictly isolated data within the same database,  
> **so that** "Mosque A" can never see "Mosque B's" data, while sharing the same codebase.

## ✅ Current Status

- ✅ `tenants` table exists in schema with `id`, `name`, `slug`, `domain`, `is_active`
- ✅ All 20 tables have `tenant_id` FK column
- ✅ No tenant middleware to auto-inject `tenant_id` into queries (Resolved via firebase-auth.ts token parsing logic)
- ✅ No tenant provisioning/onboarding flow (Resolved via POST /api/tenants)
- ✅ No Row-Level Security (RLS) policies in Neon (Resolved via custom drizzle migration 0001_rls_policies.sql)
- ✅ No seed data or migration for default tenant (Resolved via bun run db:seed script)

## 📝 Sub-Tasks

- [x] **ST-2.1** — Create `tenantMiddleware` in Hono to extract `tenant_id` from Firebase custom claims and inject into context (`c.set("tenant_id", ...)`)
- [x] **ST-2.2** — Refactor all existing routes (persons, households, transactions) to use `tenant_id` from middleware context instead of request body/query
- [x] **ST-2.3** — Create Drizzle migration for seed data: a default tenant record for dev/testing
- [x] **ST-2.4** — Build admin-only API `POST /api/tenants` to provision a new mosque tenant (creates tenant record + seed fund categories)
- [x] **ST-2.5** — Build admin-only API `GET /api/tenants` and `GET /api/tenants/:id` for tenant listing
- [x] **ST-2.6** — Add PostgreSQL Row-Level Security (RLS) policies on critical tables as a defense-in-depth measure
- [x] **ST-2.7** — Write integration tests verifying cross-tenant data isolation (Tenant A cannot read Tenant B's persons)

## 🧪 Acceptance Criteria

- [x] All API responses only return data for the authenticated user's tenant
- [x] Attempting to access another tenant's data returns 403/empty result
- [x] New tenant provisioning creates tenant + default fund categories
- [x] Integration test proves data isolation across 2+ tenants
