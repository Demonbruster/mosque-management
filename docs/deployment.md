# Mosque Management System (MMS) - Deployment Guide

This document outlines the deployment process for the Mosque Management System.

## Architecture

The system is deployed using a monorepo structure on Cloudflare's edge network:

- **Frontend**: Cloudflare Pages (React / Vite)
- **Backend**: Cloudflare Workers (Hono / bun)

## CI/CD Pipeline

We use GitHub Actions for continuous integration and deployment.

### 1. Continuous Integration (CI)

On every pull request targeting `main` or `develop`, the `.github/workflows/ci.yml` pipeline runs:

- **Typechecking**: `bun run typecheck`
- **Linting**: `bun run lint`
- **Testing**: `bun run test`

The CI pipeline must pass before a PR can be merged.

### 2. Staging Deployment

When code is pushed or merged into the `develop` branch, the `.github/workflows/deploy-staging.yml` pipeline triggers:

- Deploys the backend Worker with the `--env staging` flag.
- Deploys the frontend Pages project branch preview (`staging`).

### 3. Production Deployment

When code is pushed or merged into the `main` branch, the `.github/workflows/deploy-production.yml` pipeline triggers:

- Deploys the backend Worker to production.
- Deploys the frontend Pages project to production.

## Environment URLs

- **Production Frontend**: `https://mms-frontend.pages.dev` (Pending custom domain)
- **Production Backend**: `https://<YOUR_WORKER_PROJECT_NAME>.<YOUR_CLOUDFLARE_SUBDOMAIN>.workers.dev`
- **Staging Frontend**: `https://staging.mms-frontend.pages.dev`
- **Staging Backend**: `https://<YOUR_WORKER_PROJECT_NAME>-staging.<YOUR_CLOUDFLARE_SUBDOMAIN>.workers.dev`

## Secrets & Required Configuration

To deploy successfully, the following secrets must be added to your GitHub Repository (Settings -> Secrets and variables -> Actions) matching your Cloudflare account details:

- `CLOUDFLARE_API_TOKEN`: An API token with permissions to edit Pages and Workers.
- `CLOUDFLARE_ACCOUNT_ID`: The Account ID of the Cloudflare account.

## Branch Protection Rules (Action Required)

To ensure system stability, ensure the following GitHub branch protection rules are set for `main` and `develop` branches:

- Require pull request reviews before merging.
- Require status checks to pass before merging.
  - Required checks: `validate` (this maps to our CI action).
