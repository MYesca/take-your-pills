import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest Configuration
 * 
 * This configuration sets up Vitest for unit and integration testing
 * with React Testing Library support.
 */

export default defineConfig({
  plugins: [
    react(),
  ],
  test: {
    // Test environment
    environment: 'jsdom', // Simulates browser DOM for React components
    
    // Setup files
    setupFiles: ['./vitest.setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        'build/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types.ts',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
    },
    
    // Glob patterns for test files
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Exclude patterns
    exclude: ['node_modules', '.next', 'out', 'dist'],
  },
  resolve: {
    // Path aliases (matches tsconfig.json)
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

