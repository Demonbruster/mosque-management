CREATE TABLE "rent_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agreement_id" uuid NOT NULL,
	"amount_paid" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"discount_reason" text,
	"payment_date" date NOT NULL,
	"payment_method" "payment_method" DEFAULT 'Cash' NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"notes" text,
	"receipt_generated" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_agreement_id_tenancy_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."tenancy_agreements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rent_payment_tenant" ON "rent_payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_rent_payment_agree" ON "rent_payments" USING btree ("agreement_id");--> statement-breakpoint
CREATE INDEX "idx_rent_payment_period" ON "rent_payments" USING btree ("year","month");