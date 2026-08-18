import { defineConfig } from 'vitest/config';
import path from 'node:path';

const rootDir: string = import.meta.dirname;

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/test/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@trading-journal/shared': path.resolve(rootDir, 'packages/shared/src'),
      '@trading-journal/backend-errors': path.resolve(rootDir, 'packages/backend-errors/src'),
      '@trading-journal/backend-data': path.resolve(rootDir, 'packages/backend-data/src'),
      '@trading-journal/backend-services': path.resolve(rootDir, 'packages/backend-services/src'),
    },
  },
});