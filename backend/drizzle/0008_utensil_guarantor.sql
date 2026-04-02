-- ST-14.1: Add guarantor_id (FK to persons) for non-member issuance enforcement
ALTER TABLE "utensil_rentals" ADD COLUMN "guarantor_id" uuid;
--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD CONSTRAINT "utensil_rentals_guarantor_id_persons_id_fk" FOREIGN KEY ("guarantor_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- ST-14.4: Add return tracking columns
ALTER TABLE "utensil_rentals" ADD COLUMN "is_returned" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD COLUMN "quantity_returned" integer;
--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD COLUMN "damage_description" text;
--> statement-breakpoint

-- Indexes for performance
CREATE INDEX "idx_rental_guarantor" ON "utensil_rentals" USING btree ("guarantor_id");
--> statement-breakpoint
CREATE INDEX "idx_rental_returned" ON "utensil_rentals" USING btree ("is_returned");
