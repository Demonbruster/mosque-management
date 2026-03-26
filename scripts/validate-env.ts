import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const examplePath = resolve(process.cwd(), '.env.example');
const envPath = resolve(process.cwd(), '.env');

if (!existsSync(examplePath)) {
  console.warn('⚠️ No .env.example found, skipping validation.');
  process.exit(0);
}

if (!existsSync(envPath)) {
  console.error(
    '❌ No .env file found. Please copy .env.example to .env and fill in required values.',
  );
  process.exit(1);
}

const exampleContent = readFileSync(examplePath, 'utf8');
const expectedKeys = exampleContent
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split('=')[0]);

const missingKeys = expectedKeys.filter((key) => !process.env[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingKeys.forEach((key) => console.error(`  - ${key}`));
  console.error('Please update your .env file to include these variables based on .env.example.');
  process.exit(1);
}

console.log('✅ Environment variables validated successfully.');
