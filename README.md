# 🕌 Mosque Management System (MMS)

Multi-tenant SaaS platform for mosque administration — member management, household tracking, Shariah-compliant financial records, and WhatsApp communications.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Frontend | React 19, Vite, Mantine 7, React Router, Zustand, React Query, Axios |
| Backend | Hono (Cloudflare Workers) |
| Database | Neon (Serverless PostgreSQL) + Drizzle ORM |
| Auth | Firebase Auth (RBAC via custom claims) |
| Messaging | Twilio WhatsApp Business API |

---

## Prerequisites

Install these before starting:

1. **Bun** (v1.1+)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Wrangler CLI** (comes with the project, but for global use):
   ```bash
   bun install -g wrangler
   ```

3. **External accounts** (sign up for free tiers):
   - [Neon](https://neon.tech) — Serverless PostgreSQL
   - [Firebase](https://console.firebase.google.com) — Authentication
   - [Twilio](https://www.twilio.com) — WhatsApp API (optional for initial dev)
   - [Cloudflare](https://dash.cloudflare.com) — Workers & Pages deployment

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url> mosque-system
cd mosque-system
bun install
```

This installs all dependencies across the monorepo workspaces (`packages/shared`, `backend`, `frontend`).

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# ---- Neon (required) ----
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/mms_db?sslmode=require

# ---- Firebase (required) ----
# Frontend (prefix with VITE_ so Vite exposes them)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend (for token verification)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ---- Twilio (optional for initial dev) ----
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ---- App ----
VITE_API_URL=http://localhost:8787
CORS_ORIGIN=http://localhost:5173
```

> **Tip:** For the Cloudflare Workers backend, secrets are set separately via `wrangler secret put <KEY>` (see [Deployment](#deployment)).

### 3. Set Up the Database

Create a Neon project at [console.neon.tech](https://console.neon.tech), copy the connection string into `DATABASE_URL`, then run:

```bash
# Generate migration files from the Drizzle schema
bun run db:generate

# Apply migrations to your Neon database
bun run db:migrate
```

To explore your database visually:

```bash
bun run db:studio
```

### 4. Set Up Firebase Auth

1. Go to [Firebase Console](https://console.firebase.google.com) → Create a project
2. Enable **Email/Password** sign-in under Authentication → Sign-in Methods
3. Copy the web app config into your `.env` (the `VITE_FIREBASE_*` variables)
4. For the backend, go to Project Settings → Service Accounts → Generate a new private key
5. Copy `project_id`, `client_email`, and `private_key` into the `FIREBASE_*` backend variables

**Setting custom claims (roles)** — use the Firebase Admin SDK in a one-off script:

```js
// scripts/set-user-role.js (run with: bun run scripts/set-user-role.js)
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const uid = "USER_UID_HERE";
await admin.auth().setCustomUserClaims(uid, {
  role: "admin",           // admin | imam | treasurer | member
  tenant_id: "TENANT_UUID",
});

console.log(`Custom claims set for user ${uid}`);
```

### 5. Start Development

```bash
# Run both frontend and backend concurrently
bun run dev

# Or run them individually in separate terminals:
bun run dev:backend     # Wrangler dev server → http://localhost:8787
bun run dev:frontend    # Vite dev server    → http://localhost:5173
```

The frontend Vite config proxies `/api/*` requests to the backend at `:8787`, so you don't need to worry about CORS during local development.

---

## Project Structure

```
mosque-system/
├── packages/shared/        ← Shared TypeScript types (@mms/shared)
│   └── src/types/          ← Person, Household, Transaction interfaces
│
├── backend/                ← Hono API on Cloudflare Workers
│   ├── wrangler.toml       ← Workers config
│   ├── drizzle.config.ts   ← Drizzle Kit config
│   └── src/
│       ├── index.ts        ← App entry (middleware + route mounting)
│       ├── db/schema.ts    ← Drizzle schema (5 tables)
│       ├── db/client.ts    ← Neon connection factory
│       ├── middleware/     ← CORS, error handler, Firebase auth + RBAC
│       ├── routes/         ← health, persons, households, transactions, whatsapp
│       └── lib/twilio.ts   ← WhatsApp message helper
│
└── frontend/               ← React 19 + Vite + Mantine 7
    └── src/
        ├── App.tsx         ← Providers + Router
        ├── lib/            ← Firebase init, Axios/React Query, Auth context
        ├── store/          ← Zustand auth store
        ├── components/     ← Layout, ProtectedRoute, PublicDashboard
        └── pages/          ← DashboardPage, LoginPage
```

---

## Available Scripts

Run from the **project root**:

| Command | Description |
|---|---|
| `bun install` | Install all workspace dependencies |
| `bun run dev` | Start both frontend and backend |
| `bun run dev:frontend` | Start Vite dev server (`:5173`) |
| `bun run dev:backend` | Start Wrangler dev server (`:8787`) |
| `bun run build` | Build all workspaces |
| `bun run typecheck` | Run TypeScript checks across all workspaces |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Apply migrations to Neon |
| `bun run db:studio` | Open Drizzle Studio (DB browser) |
| `bun run deploy:workers` | Deploy backend to Cloudflare Workers |
| `bun run deploy:pages` | Build & deploy frontend to Cloudflare Pages |

---

## Deployment

### Backend → Cloudflare Workers

```bash
# 1. Login to Cloudflare
bunx wrangler login

# 2. Set secrets (one-time per secret)
cd backend
bunx wrangler secret put DATABASE_URL
bunx wrangler secret put FIREBASE_PROJECT_ID
bunx wrangler secret put FIREBASE_CLIENT_EMAIL
bunx wrangler secret put FIREBASE_PRIVATE_KEY
bunx wrangler secret put TWILIO_ACCOUNT_SID
bunx wrangler secret put TWILIO_AUTH_TOKEN
bunx wrangler secret put TWILIO_WHATSAPP_NUMBER
bunx wrangler secret put CORS_ORIGIN

# 3. Deploy
bun run deploy
```

### Frontend → Cloudflare Pages

```bash
# From project root
bun run deploy:pages
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments:
- **Build command:** `cd frontend && bun run build`
- **Build output directory:** `frontend/dist`
- **Root directory:** `/`

---

## RBAC Roles

| Role | Permissions |
|---|---|
| `admin` | Full access — manage persons, households, transactions, approve/reject |
| `imam` | Create/manage persons, households, transactions, approve/reject |
| `treasurer` | Create transactions (maker), view financial data |
| `member` | View own data, public dashboard |

Roles are set as Firebase custom claims and enforced by:
- **Backend:** `firebaseAuth()` + `requireRole()` middleware
- **Frontend:** `<ProtectedRoute requiredRoles={["admin", "imam"]} />` component

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `bun install` fails | Ensure Bun v1.1+ — run `bun --version` |
| Wrangler can't find entry | Check `wrangler.toml` has `main = "src/index.ts"` |
| CORS errors in browser | Ensure `CORS_ORIGIN` matches your frontend URL |
| Firebase auth fails | Verify all `VITE_FIREBASE_*` vars match your Firebase console |
| Database connection error | Check `DATABASE_URL` includes `?sslmode=require` |
| `@mms/shared` not found | Run `bun install` from the root to link workspaces |
