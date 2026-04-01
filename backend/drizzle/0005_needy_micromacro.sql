ALTER TABLE "transactions" ADD COLUMN "receipt_number" varchar(50);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "receipt_pdf_url" varchar(500);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receipt_number_unique" UNIQUE("receipt_number");