# 🕌 Mosque Management System (MMS) — Full Deployment Guide

This guide provides a comprehensive walkthrough for deploying the MMS from scratch to a production-ready environment on Cloudflare, Neon, and Firebase.

## Prerequisites

1.  **Cloudflare Account**: [Sign up here](https://dash.cloudflare.com)
2.  **Neon Account**: [Sign up here](https://neon.tech)
3.  **Firebase Account**: [Sign up here](https://console.firebase.google.com)
4.  **(Optional) Twilio Account**: [Sign up here](https://www.twilio.com) for WhatsApp messaging.

---

## 1. Database Setup (Neon)

1.  **Create Project**: Create a new project in the Neon console.
2.  **Connection String**: Copy the connection string (with `?sslmode=require`).
3.  **Local Configuration**: Add this to your `.env` file as `DATABASE_URL`.
4.  **Run Migrations**:
    ```bash
    bun run db:generate
    bun run db:migrate
    ```

## 2. Authentication Setup (Firebase)

1.  **Create Project**: Go to [Firebase Console](https://console.firebase.google.com) and create a project.
2.  **Enable Auth**: Under Build -> Authentication -> Sign-in method, enable **Email/Password**.
3.  **Add Web App**: Under Project Overview -> Settings, add a new **Web App**.
4.  **Frontend Env**: Copy the config (ApiKey, AuthDomain, etc.) and add to `.env`:
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    ```
5.  **Admin SDK**: Go to Project Settings -> Service Accounts -> Generate new private key.
6.  **Backend Env**: Add these to `.env` for script use:
    ```env
    FIREBASE_PROJECT_ID=...
    FIREBASE_CLIENT_EMAIL=...
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
    ```

## 3. Backend Deployment (Cloudflare Workers)

1.  **Login**: `bunx wrangler login`
2.  **Deploy**:
    ```bash
    cd backend
    # Deploy to production environment
    bunx wrangler deploy
    ```
3.  **Set Secrets**: Configure secrets in the Cloudflare dashboard or via CLI:
    ```bash
    bunx wrangler secret put DATABASE_URL
    bunx wrangler secret put FIREBASE_PROJECT_ID
    bunx wrangler secret put FIREBASE_CLIENT_EMAIL
    bunx wrangler secret put FIREBASE_PRIVATE_KEY
    bunx wrangler secret put CORS_ORIGIN  # Your frontend URL (e.g., https://mms.pages.dev)
    ```

## 4. Frontend Deployment (Cloudflare Pages)

1.  **Deploy via CLI**:
    ```bash
    bun run deploy:pages
    ```
2.  **Continuous Deployment (Recommended)**:
    - Connect your GitHub repository to Cloudflare Pages.
    - **Build command**: `cd frontend && bun run build`
    - **Output directory**: `frontend/dist`
    - **Root directory**: `/`
    - **Environment variables**: Add all `VITE_FIREBASE_*` variables to the Pages production environment.

## 5. (Critical) Onboarding a New Tenant for UAT

To create a new tenant (mosque) and assign an administrator, follow these steps:

1.  **Create a User**: Ask the UAT user to sign up via the frontend (once deployed) or create them manually in the Firebase console.
2.  **Get User UID**: Copy the UID from the Firebase Authentication table.
3.  **Run Onboarding Script**:
    ```bash
    bun run onboard-tenant "My Test Mosque" "test-mosque" <USER_UID>
    ```
    This script will:
    - Create the tenant in the database.
    - Seed default fund categories (Zakat, Sadaqah, etc.).
    - Set custom claims on the Firebase user (role: `admin`, tenant_id: `<id>`).

## 6. Infrastructure Verification

- **Health Check**: Visit `https://your-worker-url/api/health` — it should return `{ status: 'ok', database: 'connected' }`.
- **Login**: Log in to the frontend. If successful, you should see the dashboard with your tenant's name.

---

> [!IMPORTANT]
> **CORS Configuration**: Ensure `CORS_ORIGIN` in your Worker secrets precisely matches your frontend URL (including `https://`). If they don't match, the frontend will fail to fetch data.

> [!WARNING]
> **Custom Domains**: If using custom domains for both Worker and Pages, update `VITE_API_URL` in the frontend environment settings to point to your backend domain.
