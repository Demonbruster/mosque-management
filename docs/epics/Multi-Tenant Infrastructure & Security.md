## Multi-Tenant Infrastructure & Security ("The Cloning Engine")

Set up the foundational architecture to ensure the software can be replicated for multiple mosque clients while maintaining strict data isolation and enterprise-grade security

- [ ] Project skeleton (development ready code base)
- [ ] Database Templating: Configure Neon (PostgreSQL) schemas to isolate data for "Mosque A" and "Mosque B" while sharing the same codebase
- [ ] Cloudflare setup
- [ ] Authentication & RBAC: Implement Firebase Auth. Build the Role-Based Access Control (RBAC) matrix so regular devotees can only see their own data, while admins get full access
- [ ] Cloudflare CI/CD: Set up deployment pipelines for the React/Vite frontend (Cloudflare Pages) and Hono API backend (Cloudflare Workers)
