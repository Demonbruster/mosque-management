DO $$ BEGIN
    CREATE TYPE "public"."asset_condition" AS ENUM('Excellent', 'Good', 'Fair', 'Poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."asset_disposal_method" AS ENUM('Sold', 'Donated', 'Scrapped', 'Returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "unique_asset_id" varchar(50);--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "condition" "asset_condition" DEFAULT 'Good';--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "warranty_expiry" date;--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "amc_expiry" date;--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "amc_vendor" varchar(255);--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "disposal_date" date;--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD COLUMN "disposal_method" "asset_disposal_method";--> statement-breakpoint
CREATE INDEX "idx_asset_unique_id" ON "fixed_assets" USING btree ("unique_asset_id");--> statement-breakpoint
CREATE INDEX "idx_asset_active" ON "fixed_assets" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fixed_assets_unique_asset_id_unique" UNIQUE("unique_asset_id");