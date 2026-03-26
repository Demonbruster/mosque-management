import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tenants, fundCategories } from './schema';

// Bun handles .env automatically

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set in environment or .env');

const sql = neon(dbUrl);
const db = drizzle(sql);

async function main() {
  console.log('🌱 Seeding database with default tenant...');

  // 1. Check if default tenant already exists to avoid duplication
  const existingTenants = await db.select().from(tenants).limit(1);
  if (existingTenants.length > 0) {
    console.log('⚡ Tenant already exists. Skipping tenant creation.');
  } else {
    try {
      const [newTenant] = await db
        .insert(tenants)
        .values({
          name: 'Demo Mosque',
          slug: 'demo-mosque',
          domain: 'demo.mosquesystem.com',
          is_active: true,
        })
        .returning();
      console.log(`✅ Tenant created: ${newTenant.name} (${newTenant.id})`);

      // Seed default fund categories for the new tenant
      console.log('🌱 Seeding default fund categories...');
      const defaultCategories: (typeof fundCategories.$inferInsert)[] = [
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
      await db.insert(fundCategories).values(defaultCategories);
      console.log('✅ Default fund categories seeded');
    } catch (error) {
      const e = error as { code?: string };
      if (e.code === '23505') {
        console.log('⚡ Tenant with slug demo-mosque already exists.');
      } else {
        throw error;
      }
    }
  }

  // Done
  console.log('🎉 Seeding complete!');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seeding failed:');
  console.error(e);
  process.exit(1);
});
