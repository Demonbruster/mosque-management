import { defineConfig } from 'vitest/config';

/**
 * Root-level Vitest config.
 * This file controls global file discovery. Workspace project configs
 * (backend/vitest.config.ts, frontend/vitest.config.ts) handle per-project settings.
 *
 * We explicitly exclude Playwright e2e spec files here so Vitest never
 * attempts to run them as unit tests.
 */
export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts', '**/*.spec.tsx'],
  },
});
