CREATE TYPE "public"."milestone_status" AS ENUM('Not_Started', 'In_Progress', 'Completed', 'Delayed');--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_name" varchar(255) NOT NULL,
	"description" text,
	"target_date" date,
	"completion_date" date,
	"completion_percentage" integer DEFAULT 0,
	"status" "milestone_status" DEFAULT 'Not_Started' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automation_flows" DROP CONSTRAINT "automation_flows_audience_tag_id_person_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "automation_flows" ADD COLUMN "audience_tag_name" varchar(150);--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD COLUMN "project_incharge" uuid;--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD COLUMN "closure_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD COLUMN "closure_notes" text;--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD COLUMN "delay_reason" text;--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD COLUMN "final_cost" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_project_roadmap_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_roadmap"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_milestone_tenant" ON "project_milestones" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_milestone_project" ON "project_milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_milestone_status" ON "project_milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_milestone_sort" ON "project_milestones" USING btree ("sort_order");--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD CONSTRAINT "project_roadmap_project_incharge_persons_id_fk" FOREIGN KEY ("project_incharge") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_project_incharge" ON "project_roadmap" USING btree ("project_incharge");--> statement-breakpoint
CREATE INDEX "idx_txn_project" ON "transactions" USING btree ("project_id");--> statement-breakpoint
ALTER TABLE "automation_flows" DROP COLUMN "audience_tag_id";