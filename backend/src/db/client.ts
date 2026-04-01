// ============================================
// Neon Serverless Database Client
// ============================================
// Uses @neondatabase/serverless for HTTP-based
// connections compatible with Cloudflare Workers.
// ============================================

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type Env = {
  DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_NUMBER: string;
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
  RESEND_API_KEY: string;
  RECEIPTS_BUCKET: R2Bucket;
};

/**
 * Creates a Drizzle database instance from the environment.
 * Call this per-request in Cloudflare Workers (stateless).
 */
export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;
