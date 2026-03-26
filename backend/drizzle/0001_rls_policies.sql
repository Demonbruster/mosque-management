-- Custom SQL migration file, put your code below! --
-- Enable Row Level Security (RLS) on key tenant tables as a defense-in-depth measure

ALTER TABLE "persons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "households" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fund_categories" ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners/postgres roles (optional but recommended for true isolation)
ALTER TABLE "persons" FORCE ROW LEVEL SECURITY;
ALTER TABLE "households" FORCE ROW LEVEL SECURITY;
ALTER TABLE "transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "fund_categories" FORCE ROW LEVEL SECURITY;

-- Creating policies to ensure tenant isolation.
-- The application must execute: `SET app.current_tenant_id = 'xxx'` before querying.
-- This acts as a database-level safety net in case application-level `where()` clauses fail.

CREATE POLICY tenant_isolation_policy ON "persons"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_policy ON "households"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_policy ON "transactions"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_policy ON "fund_categories"
    AS PERMISSIVE FOR ALL
    TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);