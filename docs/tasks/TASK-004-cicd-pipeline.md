# TASK-004: Cloudflare CI/CD Pipeline

**Epic:** Multi-Tenant Infrastructure & Security  
**Priority:** 🔴 P0 — Critical  
**Estimate:** 2 days  
**Labels:** `epic: infrastructure`, `priority: critical`, `type: devops`  
**Assignee:** _TBD (DevOps / Backend Lead)_  
**Blocked by:** TASK-003  
**Blocks:** None (enables all future deployments)

---

## 📋 Story

> **As a** developer,  
> **I want** automated CI/CD pipelines that deploy the backend to Cloudflare Workers and frontend to Cloudflare Pages on every merge to `main`,  
> **so that** we have consistent, repeatable deployments without manual intervention.

## ✅ Current Status

- ✅ `wrangler.toml` configured for Workers deployment
- ✅ `deploy:workers` and `deploy:pages` scripts in root `package.json`
- ✅ GitHub Actions workflow files created (`ci.yml`, `deploy-staging.yml`, `deploy-production.yml`)
- ✅ Staging vs production environment separation configured
- ✅ Automated test gate before deploy configured

## 📝 Sub-Tasks

- [x] **ST-4.1** — Create `.github/workflows/ci.yml`: lint → typecheck → test on every PR
- [x] **ST-4.2** — Create `.github/workflows/deploy-staging.yml`: auto-deploy to staging on push to `develop` branch
- [x] **ST-4.3** — Create `.github/workflows/deploy-production.yml`: auto-deploy to production on merge to `main`
- [ ] **ST-4.4** — Configure Cloudflare Pages project for frontend (connect GitHub repo)
- [ ] **ST-4.5** — Set up GitHub repository secrets (Cloudflare API token, account ID, Wrangler secrets)
- [ ] **ST-4.6** — Add branch protection rules: require CI pass + 1 approval before merge to `main`
- [x] **ST-4.7** — Document the deployment process and environment URLs in `docs/deployment.md`

## 🧪 Acceptance Criteria

- [x] PRs run lint + typecheck + tests automatically
- [x] Merging to `develop` deploys to staging environment
- [x] Merging to `main` deploys to production
- [ ] Failed CI blocks merging (Pending ST-4.6)
- [x] Both frontend (Pages) and backend (Workers) deploy in the same pipeline
