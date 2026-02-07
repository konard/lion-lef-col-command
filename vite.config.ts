import { defineConfig } from 'vite';

export default defineConfig({
  base: '/col-command/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
