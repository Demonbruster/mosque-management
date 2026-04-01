CREATE TYPE "public"."transaction_type" AS ENUM('Income', 'Expense');--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "donor_name" varchar(255);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "type" "transaction_type" DEFAULT 'Income' NOT NULL;