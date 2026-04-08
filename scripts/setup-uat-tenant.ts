import admin from 'firebase-admin';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../backend/src/db/schema';

// ============================================
// Onboarding Script for UAT Tenants
// ============================================
// This script:
// 1. Creates a new tenant in the database.
// 2. Seeds default fund categories.
// 3. Assigns an admin role + tenant_id to a Firebase user.
// ============================================

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const databaseUrl = process.env.DATABASE_URL;

if (!projectId || !clientEmail || !privateKey || !databaseUrl) {
  console.error('❌ Missing credentials in .env file (FIREBASE_* or DATABASE_URL).');
  process.exit(1);
}

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

// Init Database
const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function main() {
  const [tenantName, tenantSlug, userUid] = process.argv.slice(2);

  if (!tenantName || !tenantSlug || !userUid) {
    console.log('\n🚀 MMS UAT Onboarding Tool');
    console.log('Usage: bun run onboarding-tenant <name> <slug> <firebane_uid>');
    console.log(
      'Example: bun run onboarding-tenant "Central Mosque" "central-mosque" "ABC123XYZ"\n',
    );
    process.exit(1);
  }

  try {
    console.log(`\n⏳ Onboarding tenant: "${tenantName}" (${tenantSlug})...`);

    // 1. Create Tenant
    const [newTenant] = await db
      .insert(schema.tenants)
      .values({
        name: tenantName,
        slug: tenantSlug,
        is_active: true,
      })
      .returning();

    console.log(`✅ Tenant created in DB: ${newTenant.id}`);

    // 2. Seed Default Funds
    const defaultCategories: (typeof schema.fundCategories.$inferInsert)[] = [
      {
        tenant_id: newTenant.id,
        fund_name: 'Zakat',
        compliance_type: 'ZAKAT',
        description: 'Mandatory Alms',
      },
      {
        tenant_id: newTenant.id,
        fund_name: 'Sadaqah',
        compliance_type: 'SADAQAH',
        description: 'Voluntary Charity',
      },
      {
        tenant_id: newTenant.id,
        fund_name: 'General Fund',
        compliance_type: 'GENERAL',
        description: 'General Mosque Maintenance',
      },
    ];

    await db.insert(schema.fundCategories).values(defaultCategories);
    console.log('✅ Seeded default fund categories.');

    // 3. Set Firebase Custom Claims
    const claims = {
      role: 'admin',
      tenant_id: newTenant.id,
    };

    await admin.auth().setCustomUserClaims(userUid, claims);
    console.log(`✅ Set custom claims (admin + ${newTenant.id}) for user ${userUid}.`);

    console.log('\n🎉 Onboarding Complete!');
    console.log('--------------------------------------------------');
    console.log(`Mosque: ${tenantName}`);
    console.log(`Slug:   ${tenantSlug}`);
    console.log(`Admin ID: ${userUid}`);
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    const e = error as { code?: string; message?: string };
    if (e.code === '23505') {
      console.error(`❌ Error: A tenant with slug "${tenantSlug}" already exists.`);
    } else {
      console.error('❌ Error during onboarding:', e.message || error);
    }
    process.exit(1);
  }
}

main();
