# TASK-001: Finalize Project Skeleton & Dev Environment

**Epic:** Multi-Tenant Infrastructure & Security  
**Priority:** 🔴 P0 — Critical  
**Estimate:** 3 days  
**Labels:** `epic: infrastructure`, `priority: critical`, `type: setup`  
**Assignee:** _TBD (Backend Lead)_  
**Blocked by:** None  
**Blocks:** TASK-002, TASK-003, TASK-004

---

## 📋 Story

> **As a** developer,  
> **I want** a fully configured monorepo with working dev servers, linting, testing, and shared types,  
> **so that** all team members can clone the repo and start contributing immediately.

## ✅ Current Status

The project skeleton is partially in place:
- ✅ Bun monorepo with `backend/`, `frontend/`, `packages/shared/` workspaces
- ✅ Hono backend with Cloudflare Workers config (`wrangler.toml`)
- ✅ React 19 + Vite frontend with Mantine UI
- ✅ Drizzle ORM schema (20 tables across 7 domains)
- ⬜ No linting/formatting config (ESLint, Prettier)
- ⬜ No test framework setup
- ⬜ `packages/shared` has types skeleton but needs full type exports
- ⬜ No Husky / pre-commit hooks

## 📝 Sub-Tasks

- [ ] **ST-1.1** — Set up ESLint + Prettier config at root level with workspace overrides
- [ ] **ST-1.2** — Configure Vitest for backend unit tests
- [ ] **ST-1.3** — Configure Vitest + React Testing Library for frontend
- [ ] **ST-1.4** — Add Husky pre-commit hooks (lint, typecheck)
- [ ] **ST-1.5** — Complete `@mms/shared` package with all TypeScript interfaces matching the 20-table schema
- [ ] **ST-1.6** — Add `.env.example` validation script (fail fast if required vars missing)
- [ ] **ST-1.7** — Write project `CONTRIBUTING.md` with branching strategy and PR guidelines
- [ ] **ST-1.8** — Verify `bun run dev` starts both servers cleanly with hot reload

## 🧪 Acceptance Criteria

- [ ] `bun install && bun run dev` works from a clean clone
- [ ] ESLint passes with zero warnings on all existing code
- [ ] `bun run typecheck` passes across all workspaces
- [ ] At least one passing backend test and one passing frontend test
- [ ] Shared types importable as `import { Person } from '@mms/shared'`
