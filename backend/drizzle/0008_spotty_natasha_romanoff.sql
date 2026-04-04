CREATE TYPE "public"."panchayath_case_status" AS ENUM('Open', 'In_Progress', 'Resolved', 'Dismissed');--> statement-breakpoint
CREATE TABLE "panchayath_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"complainant_id" uuid NOT NULL,
	"respondent_id" uuid,
	"subject" varchar(255) NOT NULL,
	"status" "panchayath_case_status" DEFAULT 'Open' NOT NULL,
	"resolution_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "panchayath_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"session_date" date NOT NULL,
	"notes" text,
	"next_steps" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "life_event_records" ADD COLUMN "document_urls" json;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD COLUMN "guarantor_id" uuid;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD COLUMN "is_returned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD COLUMN "quantity_returned" integer;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD COLUMN "damage_description" text;--> statement-breakpoint
ALTER TABLE "panchayath_cases" ADD CONSTRAINT "panchayath_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panchayath_cases" ADD CONSTRAINT "panchayath_cases_complainant_id_persons_id_fk" FOREIGN KEY ("complainant_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panchayath_cases" ADD CONSTRAINT "panchayath_cases_respondent_id_persons_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panchayath_sessions" ADD CONSTRAINT "panchayath_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panchayath_sessions" ADD CONSTRAINT "panchayath_sessions_case_id_panchayath_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."panchayath_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_panchayath_tenant" ON "panchayath_cases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_panchayath_status" ON "panchayath_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_panchayath_session_tenant" ON "panchayath_sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_panchayath_session_case" ON "panchayath_sessions" USING btree ("case_id");--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD CONSTRAINT "utensil_rentals_guarantor_id_persons_id_fk" FOREIGN KEY ("guarantor_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rental_guarantor" ON "utensil_rentals" USING btree ("guarantor_id");--> statement-breakpoint
CREATE INDEX "idx_rental_returned" ON "utensil_rentals" USING btree ("is_returned");