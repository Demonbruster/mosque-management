CREATE TYPE "public"."message_template_category" AS ENUM('MARKETING', 'UTILITY', 'AUTHENTICATION');--> statement-breakpoint
CREATE TYPE "public"."message_template_status" AS ENUM('Draft', 'Submitted', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"template_body" text NOT NULL,
	"header_text" varchar(255),
	"footer_text" varchar(255),
	"variables" json,
	"cta_buttons" json,
	"category" "message_template_category" DEFAULT 'MARKETING' NOT NULL,
	"approval_status" "message_template_status" DEFAULT 'Draft' NOT NULL,
	"meta_template_id" varchar(255),
	"language" varchar(10) DEFAULT 'en_US' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_template_tenant" ON "message_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_template_status" ON "message_templates" USING btree ("approval_status");