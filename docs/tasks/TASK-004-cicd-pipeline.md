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
- ⬜ No GitHub Actions workflow files
- ⬜ No staging vs production environment separation
- ⬜ No automated test gate before deploy

## 📝 Sub-Tasks

- [ ] **ST-4.1** — Create `.github/workflows/ci.yml`: lint → typecheck → test on every PR
- [ ] **ST-4.2** — Create `.github/workflows/deploy-staging.yml`: auto-deploy to staging on push to `develop` branch
- [ ] **ST-4.3** — Create `.github/workflows/deploy-production.yml`: auto-deploy to production on merge to `main`
- [ ] **ST-4.4** — Configure Cloudflare Pages project for frontend (connect GitHub repo)
- [ ] **ST-4.5** — Set up GitHub repository secrets (Cloudflare API token, account ID, Wrangler secrets)
- [ ] **ST-4.6** — Add branch protection rules: require CI pass + 1 approval before merge to `main`
- [ ] **ST-4.7** — Document the deployment process and environment URLs in `docs/deployment.md`

## 🧪 Acceptance Criteria

- [ ] PRs run lint + typecheck + tests automatically
- [ ] Merging to `develop` deploys to staging environment
- [ ] Merging to `main` deploys to production
- [ ] Failed CI blocks merging
- [ ] Both frontend (Pages) and backend (Workers) deploy in the same pipeline
