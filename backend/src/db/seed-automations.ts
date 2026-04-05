// ============================================
// Seed Script - Donation Concierge Flow
// ============================================

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tenants, automationFlows } from './schema';
import { eq } from 'drizzle-orm';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');

const sql = neon(dbUrl);
const db = drizzle(sql);

async function main() {
  console.log('🌱 Seeding Donation Concierge Flow...');

  const [demoTenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, 'demo-mosque'))
    .limit(1);
  if (!demoTenant) {
    console.error('❌ Demo tenant not found. Please run main seed first.');
    process.exit(1);
  }

  const donationFlow = {
    tenant_id: demoTenant.id,
    name: 'Donation Concierge',
    description: 'Automated flow to assist with donations.',
    trigger_type: 'Keyword' as const,
    trigger_value: 'DONATE',
    is_active: true,
    is_system: true,
    steps: [
      {
        id: 'start',
        type: 'message',
        content:
          'Assalamu Alaikum! Thank you for your interest in supporting the mosque. I can help you with your donation today.',
        next_step_id: 'fund_selection',
      },
      {
        id: 'fund_selection',
        type: 'choice',
        content: 'Which fund would you like to contribute to?',
        variable_name: 'selected_fund',
        options: [
          { label: 'Zakat', value: 'Zakat', next_step_id: 'amount_prompt' },
          { label: 'Sadaqah', value: 'Sadaqah', next_step_id: 'amount_prompt' },
          { label: 'General Fund', value: 'General Fund', next_step_id: 'amount_prompt' },
          { label: 'Speak to Staff', value: 'Staff', next_step_id: 'handoff' },
        ],
      },
      {
        id: 'amount_prompt',
        type: 'question',
        content:
          'Great! You have selected {{selected_fund}}. How much would you like to donate? (Type the amount, e.g., 500)',
        variable_name: 'amount',
        next_step_id: 'confirmation',
      },
      {
        id: 'confirmation',
        type: 'message',
        content:
          'Jazakallah Khair! You are donating {{amount}} to the {{selected_fund}}. Please use this link to complete your payment: https://demo.mosque.com/pay?amount={{amount}}&fund={{selected_fund}}',
      },
      {
        id: 'handoff',
        type: 'handoff',
        content: 'Connecting you to staff...',
      },
    ],
  };

  await db.insert(automationFlows).values(donationFlow).onConflictDoNothing();
  console.log('✅ Donation Concierge seeded.');
  process.exit(0);
}

main().catch(console.error);
