// ============================================
// Drizzle ORM Schema — Mosque Management System
// ============================================
// Full 20-table schema across 7 domains:
//   1. Core CRM & Dynamic Households
//   2. ISAK-35 Compliant Financials & ERP
//   3. Assets, Rentals & Utensils
//   4. Omnichannel & WhatsApp Broadcasting
//   5. Strategic Projects & Governance
//   6. Human Resources & Payroll
//   7. Education (Madrasa/Hifl) & Life Events
// ============================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  boolean,
  decimal,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// ============================================
// ENUMS
// ============================================

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

export const personCategoryEnum = pgEnum('person_category', [
  'Member',
  'Non-Member',
  'Dependent',
  'Staff',
  'Hifl',
]);

export const householdRoleEnum = pgEnum('household_role', ['Head', 'Spouse', 'Dependent']);

export const relationshipCodeEnum = pgEnum('relationship_code', [
  'Parent',
  'Child',
  'Sibling',
  'Spouse',
  'Grandparent',
  'Grandchild',
  'Uncle',
  'Aunt',
  'Cousin',
  'Other',
]);

export const fundCategoryTypeEnum = pgEnum('fund_category_type', [
  'ZAKAT',
  'SADAQAH',
  'WAQF',
  'GENERAL',
  'FITRAH',
  'LILLAH',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'Pending',
  'Approved',
  'Rejected',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'Cash',
  'Google_Pay',
  'Bank_Transfer',
  'UPI',
  'Cheque',
]);

export const transactionTypeEnum = pgEnum('transaction_type', ['Income', 'Expense']);

export const paymentStatusEnum = pgEnum('payment_status', [
  'Paid',
  'Not_Paid',
  'Pending',
  'Waived',
]);

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'Sent',
  'Delivered',
  'Read',
  'Failed',
]);

export const projectPhaseEnum = pgEnum('project_phase', ['Past', 'Present', 'Future']);

export const meetingTypeEnum = pgEnum('meeting_type', ['Jamath', 'Management', 'Panchayath']);

export const agreementStatusEnum = pgEnum('agreement_status', [
  'Active',
  'Expired',
  'Terminated',
  'Pending',
]);

export const eventTypeEnum = pgEnum('event_type', [
  'Marriage',
  'Divorce',
  'Death',
  'Birth',
  'Conversion',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'Active',
  'Completed',
  'Dropped',
  'Suspended',
]);

// ============================================
// 0. MULTI-TENANCY
// ============================================

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ============================================
// 1. CORE CRM & DYNAMIC HOUSEHOLDS
// ============================================

export const persons = pgTable(
  'persons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    first_name: varchar('first_name', { length: 150 }).notNull(),
    last_name: varchar('last_name', { length: 150 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone_number: varchar('phone_number', { length: 20 }),
    dob: date('dob'),
    gender: genderEnum('gender'),
    category: personCategoryEnum('category').notNull().default('Member'),
    whatsapp_opt_in: boolean('whatsapp_opt_in').default(false).notNull(),
    national_id: varchar('national_id', { length: 50 }),
    notes: text('notes'),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_persons_tenant').on(table.tenant_id),
    index('idx_persons_name').on(table.first_name, table.last_name),
    index('idx_persons_phone').on(table.phone_number),
    index('idx_persons_category').on(table.category),
  ],
);

export const households = pgTable(
  'households',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    address_line_1: varchar('address_line_1', { length: 500 }).notNull(),
    address_line_2: varchar('address_line_2', { length: 500 }),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 100 }),
    postal_code: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 100 }).default('IN'),
    mahalla_zone: varchar('mahalla_zone', { length: 100 }),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_households_tenant').on(table.tenant_id),
    index('idx_households_mahalla').on(table.mahalla_zone),
  ],
);

export const personHouseholdLinks = pgTable(
  'person_household_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    person_id: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    household_id: uuid('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    household_role: householdRoleEnum('household_role').notNull().default('Dependent'),
    start_date: date('start_date').notNull(),
    end_date: date('end_date'),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_phl_person').on(table.person_id),
    index('idx_phl_household').on(table.household_id),
    index('idx_phl_active').on(table.is_active),
  ],
);

export const personRelationships = pgTable(
  'person_relationships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    person_id_a: uuid('person_id_a')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    person_id_b: uuid('person_id_b')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    relationship_code: relationshipCodeEnum('relationship_code').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_rel_person_a').on(table.person_id_a),
    index('idx_rel_person_b').on(table.person_id_b),
  ],
);

// ============================================
// 2. ISAK-35 COMPLIANT FINANCIALS & ERP
// ============================================

export const fundCategories = pgTable(
  'fund_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    fund_name: varchar('fund_name', { length: 150 }).notNull(),
    compliance_type: fundCategoryTypeEnum('compliance_type').notNull(),
    description: text('description'),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_fund_tenant').on(table.tenant_id)],
);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    donor_id: uuid('donor_id').references(() => persons.id, { onDelete: 'set null' }),
    donor_name: varchar('donor_name', { length: 255 }), // For anonymous or outsider donors
    admin_id: uuid('admin_id').references(() => persons.id, { onDelete: 'set null' }),
    fund_id: uuid('fund_id')
      .notNull()
      .references(() => fundCategories.id, { onDelete: 'restrict' }),
    type: transactionTypeEnum('type').notNull().default('Income'),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    payment_method: paymentMethodEnum('payment_method').notNull().default('Cash'),
    status: transactionStatusEnum('status').notNull().default('Pending'),
    description: text('description'),
    reference_number: varchar('reference_number', { length: 100 }),
    transaction_date: timestamp('transaction_date', { withTimezone: true }).defaultNow().notNull(),
    notes: text('notes'),
    approved_by: uuid('approved_by').references(() => persons.id, { onDelete: 'set null' }),
    approved_at: timestamp('approved_at', { withTimezone: true }),
    rejection_reason: text('rejection_reason'),
    receipt_number: varchar('receipt_number', { length: 50 }).unique(),
    receipt_pdf_url: varchar('receipt_pdf_url', { length: 500 }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_txn_tenant').on(table.tenant_id),
    index('idx_txn_donor').on(table.donor_id),
    index('idx_txn_fund').on(table.fund_id),
    index('idx_txn_status').on(table.status),
    index('idx_txn_date').on(table.transaction_date),
  ],
);

export const periodicSubscriptions = pgTable(
  'periodic_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    person_id: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    subscription_type: varchar('subscription_type', { length: 150 }).notNull(),
    month: integer('month').notNull(),
    year: integer('year').notNull(),
    payment_status: paymentStatusEnum('payment_status').notNull().default('Not_Paid'),
    amount: decimal('amount', { precision: 12, scale: 2 }),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_sub_tenant').on(table.tenant_id),
    index('idx_sub_person').on(table.person_id),
    index('idx_sub_period').on(table.year, table.month),
    index('idx_sub_status').on(table.payment_status),
  ],
);

// ============================================
// 3. ASSETS, RENTALS & UTENSILS
// ============================================

export const fixedAssets = pgTable(
  'fixed_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    fund_source: varchar('fund_source', { length: 150 }),
    purchase_price: decimal('purchase_price', { precision: 12, scale: 2 }),
    current_value: decimal('current_value', { precision: 12, scale: 2 }),
    acquisition_date: date('acquisition_date'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_asset_tenant').on(table.tenant_id)],
);

export const tenancyAgreements = pgTable(
  'tenancy_agreements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    person_id: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    asset_id: uuid('asset_id')
      .notNull()
      .references(() => fixedAssets.id, { onDelete: 'cascade' }),
    rent_amount: decimal('rent_amount', { precision: 12, scale: 2 }).notNull(),
    security_deposit: decimal('security_deposit', { precision: 12, scale: 2 }),
    start_date: date('start_date').notNull(),
    end_date: date('end_date'),
    status: agreementStatusEnum('status').notNull().default('Pending'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_tenancy_tenant').on(table.tenant_id),
    index('idx_tenancy_person').on(table.person_id),
    index('idx_tenancy_asset').on(table.asset_id),
    index('idx_tenancy_status').on(table.status),
  ],
);

export const utensilInventory = pgTable(
  'utensil_inventory',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    item_name: varchar('item_name', { length: 255 }).notNull(),
    description: text('description'),
    stock_quantity: integer('stock_quantity').notNull().default(0),
    rental_price: decimal('rental_price', { precision: 10, scale: 2 }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_utensil_tenant').on(table.tenant_id)],
);

export const utensilRentals = pgTable(
  'utensil_rentals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    customer_id: uuid('customer_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    utensil_id: uuid('utensil_id')
      .notNull()
      .references(() => utensilInventory.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    issue_date: date('issue_date').notNull(),
    return_date: date('return_date'),
    penalty_fee: decimal('penalty_fee', { precision: 10, scale: 2 }).default('0'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_rental_tenant').on(table.tenant_id),
    index('idx_rental_customer').on(table.customer_id),
    index('idx_rental_utensil').on(table.utensil_id),
  ],
);

// ============================================
// 4. OMNICHANNEL & WHATSAPP BROADCASTING
// ============================================

export const communicationLogs = pgTable(
  'communication_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    person_id: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    channel: varchar('channel', { length: 50 }).notNull().default('whatsapp'),
    message_template: text('message_template'),
    message_body: text('message_body'),
    delivery_status: deliveryStatusEnum('delivery_status').notNull().default('Sent'),
    external_message_id: varchar('external_message_id', { length: 255 }),
    sent_at: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
    delivered_at: timestamp('delivered_at', { withTimezone: true }),
    read_at: timestamp('read_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_comms_tenant').on(table.tenant_id),
    index('idx_comms_person').on(table.person_id),
    index('idx_comms_status').on(table.delivery_status),
    index('idx_comms_sent').on(table.sent_at),
  ],
);

// ============================================
// 5. STRATEGIC PROJECTS & GOVERNANCE
// ============================================

export const projectRoadmap = pgTable(
  'project_roadmap',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    project_name: varchar('project_name', { length: 255 }).notNull(),
    description: text('description'),
    phase: projectPhaseEnum('phase').notNull().default('Future'),
    estimated_budget: decimal('estimated_budget', { precision: 14, scale: 2 }),
    actual_spend: decimal('actual_spend', { precision: 14, scale: 2 }),
    completion_percentage: integer('completion_percentage').default(0),
    start_date: date('start_date'),
    target_end_date: date('target_end_date'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_project_tenant').on(table.tenant_id),
    index('idx_project_phase').on(table.phase),
  ],
);

export const meetingLogs = pgTable(
  'meeting_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    meeting_type: meetingTypeEnum('meeting_type').notNull(),
    meeting_date: date('meeting_date').notNull(),
    title: varchar('title', { length: 255 }),
    minutes_text: text('minutes_text'),
    attendees_count: integer('attendees_count'),
    is_locked: boolean('is_locked').default(false).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_meeting_tenant').on(table.tenant_id),
    index('idx_meeting_date').on(table.meeting_date),
    index('idx_meeting_type').on(table.meeting_type),
  ],
);

export const managementCommittees = pgTable(
  'management_committees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    person_id: uuid('person_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    role_title: varchar('role_title', { length: 150 }).notNull(),
    tenure_start: date('tenure_start').notNull(),
    tenure_end: date('tenure_end'),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_committee_tenant').on(table.tenant_id),
    index('idx_committee_person').on(table.person_id),
    index('idx_committee_active').on(table.is_active),
  ],
);

// ============================================
// 6. HUMAN RESOURCES & PAYROLL
// ============================================

export const employeePayrolls = pgTable(
  'employee_payrolls',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    employee_id: uuid('employee_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    basic_salary: decimal('basic_salary', { precision: 12, scale: 2 }).notNull(),
    allowances: decimal('allowances', { precision: 12, scale: 2 }).default('0'),
    deductions: decimal('deductions', { precision: 12, scale: 2 }).default('0'),
    net_salary: decimal('net_salary', { precision: 12, scale: 2 }),
    payment_date: date('payment_date').notNull(),
    month: integer('month').notNull(),
    year: integer('year').notNull(),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_payroll_tenant').on(table.tenant_id),
    index('idx_payroll_employee').on(table.employee_id),
    index('idx_payroll_period').on(table.year, table.month),
  ],
);

export const employeeLoans = pgTable(
  'employee_loans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    employee_id: uuid('employee_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    total_amount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    pending_balance: decimal('pending_balance', { precision: 12, scale: 2 }).notNull(),
    monthly_deduction: decimal('monthly_deduction', { precision: 12, scale: 2 }).notNull(),
    start_date: date('start_date'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_loan_tenant').on(table.tenant_id),
    index('idx_loan_employee').on(table.employee_id),
  ],
);

// ============================================
// 7. EDUCATION (MADRASA / HIFL) & LIFE EVENTS
// ============================================

export const madrasaClasses = pgTable(
  'madrasa_classes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    class_name: varchar('class_name', { length: 150 }).notNull(),
    description: text('description'),
    schedule: varchar('schedule', { length: 255 }),
    teacher_id: uuid('teacher_id').references(() => persons.id, { onDelete: 'set null' }),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_class_tenant').on(table.tenant_id)],
);

export const studentEnrollments = pgTable(
  'student_enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    student_id: uuid('student_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    class_id: uuid('class_id')
      .notNull()
      .references(() => madrasaClasses.id, { onDelete: 'cascade' }),
    enrollment_date: date('enrollment_date').notNull(),
    status: enrollmentStatusEnum('status').notNull().default('Active'),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_enrollment_tenant').on(table.tenant_id),
    index('idx_enrollment_student').on(table.student_id),
    index('idx_enrollment_class').on(table.class_id),
    index('idx_enrollment_status').on(table.status),
  ],
);

export const lifeEventRecords = pgTable(
  'life_event_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    event_type: eventTypeEnum('event_type').notNull(),
    person_a_id: uuid('person_a_id')
      .notNull()
      .references(() => persons.id, { onDelete: 'cascade' }),
    person_b_id: uuid('person_b_id').references(() => persons.id, { onDelete: 'set null' }),
    event_date: date('event_date').notNull(),
    certificate_no: varchar('certificate_no', { length: 100 }),
    location: varchar('location', { length: 255 }),
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_event_tenant').on(table.tenant_id),
    index('idx_event_type').on(table.event_type),
    index('idx_event_person_a').on(table.person_a_id),
    index('idx_event_date').on(table.event_date),
  ],
);

// ============================================
// 8. SYSTEM & AUDIT
// ============================================

export const systemAuditLogs = pgTable(
  'system_audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenant_id: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    user_id: varchar('user_id', { length: 255 }).notNull(), // Firebase UID
    action: varchar('action', { length: 255 }).notNull(),
    resource: varchar('resource', { length: 255 }).notNull(),
    target_id: varchar('target_id', { length: 255 }),
    details: text('details'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_tenant').on(table.tenant_id),
    index('idx_audit_user').on(table.user_id),
    index('idx_audit_action').on(table.action),
    index('idx_audit_created_at').on(table.created_at),
  ],
);
