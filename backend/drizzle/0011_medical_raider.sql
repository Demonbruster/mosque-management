CREATE TYPE "public"."automation_trigger_type" AS ENUM('Keyword', 'Schedule', 'Event');--> statement-breakpoint
CREATE TABLE "automation_flows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"trigger_type" "automation_trigger_type" DEFAULT 'Keyword' NOT NULL,
	"trigger_value" varchar(255) NOT NULL,
	"steps" json NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"flow_id" uuid NOT NULL,
	"current_step_id" varchar(100),
	"metadata" json DEFAULT '{}'::json,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automation_flows" ADD CONSTRAINT "automation_flows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_states" ADD CONSTRAINT "conversation_states_flow_id_automation_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."automation_flows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_flow_tenant" ON "automation_flows" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_flow_trigger" ON "automation_flows" USING btree ("trigger_type","trigger_value");--> statement-breakpoint
CREATE INDEX "idx_flow_active" ON "automation_flows" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_state_tenant" ON "conversation_states" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_state_person" ON "conversation_states" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_state_flow" ON "conversation_states" USING btree ("flow_id");--> statement-breakpoint
CREATE INDEX "idx_state_expires" ON "conversation_states" USING btree ("expires_at");