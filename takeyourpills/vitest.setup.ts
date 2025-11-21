/**
 * Vitest Setup File
 * 
 * This file runs before each test file.
 * Use it to configure test environment, mocks, or global test utilities.
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia for tests that use media queries
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

