export default [
  {
    extends: 'backend/vitest.config.ts',
    test: {
      name: 'backend',
      root: './backend',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
  {
    extends: 'frontend/vitest.config.ts',
    test: {
      name: 'frontend',
      root: './frontend',
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
  },
  {
    test: {
      name: 'shared',
      root: './packages/shared',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
];
