/**
 * Example Test File
 * 
 * This is a simple test to verify that Vitest and React Testing Library
 * are configured correctly.
 */

import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math operations', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
    expect(10 - 5).toBe(5);
  });

  it('should work with strings', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toBe('Hello, World!');
    expect(greeting.length).toBe(13);
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});

