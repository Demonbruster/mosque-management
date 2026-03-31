CREATE TABLE "system_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"resource" varchar(255) NOT NULL,
	"target_id" varchar(255),
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_audit_logs" ADD CONSTRAINT "system_audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_tenant" ON "system_audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "system_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "system_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_created_at" ON "system_audit_logs" USING btree ("created_at");