CREATE TYPE "public"."agreement_status" AS ENUM('Active', 'Expired', 'Terminated', 'Pending');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('Sent', 'Delivered', 'Read', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('Active', 'Completed', 'Dropped', 'Suspended');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('Marriage', 'Divorce', 'Death', 'Birth', 'Conversion');--> statement-breakpoint
CREATE TYPE "public"."fund_category_type" AS ENUM('ZAKAT', 'SADAQAH', 'WAQF', 'GENERAL', 'FITRAH', 'LILLAH');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."household_role" AS ENUM('Head', 'Spouse', 'Dependent');--> statement-breakpoint
CREATE TYPE "public"."meeting_type" AS ENUM('Jamath', 'Management', 'Panchayath');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('Cash', 'Google_Pay', 'Bank_Transfer', 'UPI', 'Cheque');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Paid', 'Not_Paid', 'Pending', 'Waived');--> statement-breakpoint
CREATE TYPE "public"."person_category" AS ENUM('Member', 'Non-Member', 'Dependent', 'Staff', 'Hifl');--> statement-breakpoint
CREATE TYPE "public"."project_phase" AS ENUM('Past', 'Present', 'Future');--> statement-breakpoint
CREATE TYPE "public"."relationship_code" AS ENUM('Parent', 'Child', 'Sibling', 'Spouse', 'Grandparent', 'Grandchild', 'Uncle', 'Aunt', 'Cousin', 'Other');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"channel" varchar(50) DEFAULT 'whatsapp' NOT NULL,
	"message_template" text,
	"message_body" text,
	"delivery_status" "delivery_status" DEFAULT 'Sent' NOT NULL,
	"external_message_id" varchar(255),
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"pending_balance" numeric(12, 2) NOT NULL,
	"monthly_deduction" numeric(12, 2) NOT NULL,
	"start_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_payrolls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"basic_salary" numeric(12, 2) NOT NULL,
	"allowances" numeric(12, 2) DEFAULT '0',
	"deductions" numeric(12, 2) DEFAULT '0',
	"net_salary" numeric(12, 2),
	"payment_date" date NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fixed_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"fund_source" varchar(150),
	"purchase_price" numeric(12, 2),
	"current_value" numeric(12, 2),
	"acquisition_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"fund_name" varchar(150) NOT NULL,
	"compliance_type" "fund_category_type" NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"address_line_1" varchar(500) NOT NULL,
	"address_line_2" varchar(500),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100) DEFAULT 'IN',
	"mahalla_zone" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_event_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"person_a_id" uuid NOT NULL,
	"person_b_id" uuid,
	"event_date" date NOT NULL,
	"certificate_no" varchar(100),
	"location" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "madrasa_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"class_name" varchar(150) NOT NULL,
	"description" text,
	"schedule" varchar(255),
	"teacher_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "management_committees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"role_title" varchar(150) NOT NULL,
	"tenure_start" date NOT NULL,
	"tenure_end" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"meeting_type" "meeting_type" NOT NULL,
	"meeting_date" date NOT NULL,
	"title" varchar(255),
	"minutes_text" text,
	"attendees_count" integer,
	"is_locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "periodic_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"subscription_type" varchar(150) NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"payment_status" "payment_status" DEFAULT 'Not_Paid' NOT NULL,
	"amount" numeric(12, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_household_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"household_id" uuid NOT NULL,
	"household_role" "household_role" DEFAULT 'Dependent' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id_a" uuid NOT NULL,
	"person_id_b" uuid NOT NULL,
	"relationship_code" "relationship_code" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"first_name" varchar(150) NOT NULL,
	"last_name" varchar(150) NOT NULL,
	"email" varchar(255),
	"phone_number" varchar(20),
	"dob" date,
	"gender" "gender",
	"category" "person_category" DEFAULT 'Member' NOT NULL,
	"whatsapp_opt_in" boolean DEFAULT false NOT NULL,
	"national_id" varchar(50),
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_roadmap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"project_name" varchar(255) NOT NULL,
	"description" text,
	"phase" "project_phase" DEFAULT 'Future' NOT NULL,
	"estimated_budget" numeric(14, 2),
	"actual_spend" numeric(14, 2),
	"completion_percentage" integer DEFAULT 0,
	"start_date" date,
	"target_end_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"enrollment_date" date NOT NULL,
	"status" "enrollment_status" DEFAULT 'Active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenancy_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"rent_amount" numeric(12, 2) NOT NULL,
	"security_deposit" numeric(12, 2),
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "agreement_status" DEFAULT 'Pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"donor_id" uuid,
	"admin_id" uuid,
	"fund_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'Cash' NOT NULL,
	"status" "transaction_status" DEFAULT 'Pending' NOT NULL,
	"description" text,
	"reference_number" varchar(100),
	"transaction_date" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utensil_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"description" text,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"rental_price" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utensil_rentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"utensil_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"issue_date" date NOT NULL,
	"return_date" date,
	"penalty_fee" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_loans" ADD CONSTRAINT "employee_loans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_loans" ADD CONSTRAINT "employee_loans_employee_id_persons_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_payrolls" ADD CONSTRAINT "employee_payrolls_employee_id_persons_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fixed_assets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_categories" ADD CONSTRAINT "fund_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_event_records" ADD CONSTRAINT "life_event_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_event_records" ADD CONSTRAINT "life_event_records_person_a_id_persons_id_fk" FOREIGN KEY ("person_a_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_event_records" ADD CONSTRAINT "life_event_records_person_b_id_persons_id_fk" FOREIGN KEY ("person_b_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "madrasa_classes" ADD CONSTRAINT "madrasa_classes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "madrasa_classes" ADD CONSTRAINT "madrasa_classes_teacher_id_persons_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_committees" ADD CONSTRAINT "management_committees_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_committees" ADD CONSTRAINT "management_committees_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_logs" ADD CONSTRAINT "meeting_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periodic_subscriptions" ADD CONSTRAINT "periodic_subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periodic_subscriptions" ADD CONSTRAINT "periodic_subscriptions_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_household_links" ADD CONSTRAINT "person_household_links_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_household_links" ADD CONSTRAINT "person_household_links_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_relationships" ADD CONSTRAINT "person_relationships_person_id_a_persons_id_fk" FOREIGN KEY ("person_id_a") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_relationships" ADD CONSTRAINT "person_relationships_person_id_b_persons_id_fk" FOREIGN KEY ("person_id_b") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_roadmap" ADD CONSTRAINT "project_roadmap_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_persons_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_class_id_madrasa_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."madrasa_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_asset_id_fixed_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."fixed_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_donor_id_persons_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_admin_id_persons_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."persons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fund_id_fund_categories_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."fund_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utensil_inventory" ADD CONSTRAINT "utensil_inventory_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD CONSTRAINT "utensil_rentals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD CONSTRAINT "utensil_rentals_customer_id_persons_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utensil_rentals" ADD CONSTRAINT "utensil_rentals_utensil_id_utensil_inventory_id_fk" FOREIGN KEY ("utensil_id") REFERENCES "public"."utensil_inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_comms_tenant" ON "communication_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_comms_person" ON "communication_logs" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_comms_status" ON "communication_logs" USING btree ("delivery_status");--> statement-breakpoint
CREATE INDEX "idx_comms_sent" ON "communication_logs" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_loan_tenant" ON "employee_loans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_loan_employee" ON "employee_loans" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_tenant" ON "employee_payrolls" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_employee" ON "employee_payrolls" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_period" ON "employee_payrolls" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "idx_asset_tenant" ON "fixed_assets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_fund_tenant" ON "fund_categories" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_households_tenant" ON "households" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_households_mahalla" ON "households" USING btree ("mahalla_zone");--> statement-breakpoint
CREATE INDEX "idx_event_tenant" ON "life_event_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_event_type" ON "life_event_records" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_event_person_a" ON "life_event_records" USING btree ("person_a_id");--> statement-breakpoint
CREATE INDEX "idx_event_date" ON "life_event_records" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "idx_class_tenant" ON "madrasa_classes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_committee_tenant" ON "management_committees" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_committee_person" ON "management_committees" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_committee_active" ON "management_committees" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_meeting_tenant" ON "meeting_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_meeting_date" ON "meeting_logs" USING btree ("meeting_date");--> statement-breakpoint
CREATE INDEX "idx_meeting_type" ON "meeting_logs" USING btree ("meeting_type");--> statement-breakpoint
CREATE INDEX "idx_sub_tenant" ON "periodic_subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_sub_person" ON "periodic_subscriptions" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_sub_period" ON "periodic_subscriptions" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "idx_sub_status" ON "periodic_subscriptions" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_phl_person" ON "person_household_links" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_phl_household" ON "person_household_links" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "idx_phl_active" ON "person_household_links" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_rel_person_a" ON "person_relationships" USING btree ("person_id_a");--> statement-breakpoint
CREATE INDEX "idx_rel_person_b" ON "person_relationships" USING btree ("person_id_b");--> statement-breakpoint
CREATE INDEX "idx_persons_tenant" ON "persons" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_persons_name" ON "persons" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "idx_persons_phone" ON "persons" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_persons_category" ON "persons" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_project_tenant" ON "project_roadmap" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_project_phase" ON "project_roadmap" USING btree ("phase");--> statement-breakpoint
CREATE INDEX "idx_enrollment_tenant" ON "student_enrollments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_enrollment_student" ON "student_enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_enrollment_class" ON "student_enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "idx_enrollment_status" ON "student_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tenancy_tenant" ON "tenancy_agreements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tenancy_person" ON "tenancy_agreements" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "idx_tenancy_asset" ON "tenancy_agreements" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_tenancy_status" ON "tenancy_agreements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_txn_tenant" ON "transactions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_txn_donor" ON "transactions" USING btree ("donor_id");--> statement-breakpoint
CREATE INDEX "idx_txn_fund" ON "transactions" USING btree ("fund_id");--> statement-breakpoint
CREATE INDEX "idx_txn_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_txn_date" ON "transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "idx_utensil_tenant" ON "utensil_inventory" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_rental_tenant" ON "utensil_rentals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_rental_customer" ON "utensil_rentals" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_rental_utensil" ON "utensil_rentals" USING btree ("utensil_id");