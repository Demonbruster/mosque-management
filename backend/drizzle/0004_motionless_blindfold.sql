ALTER TABLE "transactions" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_persons_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;