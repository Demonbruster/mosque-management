CREATE TYPE "public"."broadcast_campaign_status" AS ENUM('Draft', 'Scheduled', 'Sending', 'Completed');--> statement-breakpoint
CREATE TABLE "broadcast_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"segment_filter" json,
	"template_id" varchar(255),
	"status" "broadcast_campaign_status" DEFAULT 'Draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"total_count" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"tag_name" varchar(150) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "idx_panchayath_tenant";--> statement-breakpoint
ALTER TABLE "panchayath_cases" ADD COLUMN "case_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "broadcast_campaigns" ADD CONSTRAINT "broadcast_campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_tags" ADD CONSTRAINT "person_tags_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_broadcast_tenant" ON "broadcast_campaigns" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_broadcast_status" ON "broadcast_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_person_tag_tenant" ON "person_tags" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_person_tag_person" ON "person_tags" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_person_tag_name" ON "person_tags" USING btree ("tag_name");--> statement-breakpoint
CREATE INDEX "idx_panchayath_case_tenant" ON "panchayath_cases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_panchayath_case_id" ON "panchayath_cases" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "idx_panchayath_complainant" ON "panchayath_cases" USING btree ("complainant_id");--> statement-breakpoint
CREATE INDEX "idx_panchayath_respondent" ON "panchayath_cases" USING btree ("respondent_id");--> statement-breakpoint
CREATE INDEX "idx_panchayath_session_date" ON "panchayath_sessions" USING btree ("session_date");