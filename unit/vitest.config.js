import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './report/index.html',
    },
  },
});
