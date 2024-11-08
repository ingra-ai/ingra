import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@repo/db': path.resolve(__dirname, '../database/src'),
      '@repo/shared': path.resolve(__dirname, 'src'),
      '@repo/components': path.resolve(__dirname, '../components/src'),
    },
  },
});
