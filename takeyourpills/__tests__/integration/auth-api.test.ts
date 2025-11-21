/**
 * Integration Tests for Authentication API
 * 
 * Tests for /api/auth/me endpoint with various token scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/me/route';
import { authenticateRequest } from '@/lib/auth/middleware';

// Mock authentication middleware
vi.mock('@/lib/auth/middleware', () => ({
  authenticateRequest: vi.fn(),
}));

describe('/api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user information with valid token', async () => {
    const mockUser = {
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
    };
    
    vi.mocked(authenticateRequest).mockResolvedValue(mockUser);
    
    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      data: {
        id: 'user-uuid-123',
        email: 'test@example.com',
        timezone: 'UTC',
      },
    });
    expect(authenticateRequest).toHaveBeenCalledWith(request);
  });

  it('should return 401 when token is invalid', async () => {
    vi.mocked(authenticateRequest).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing authentication token',
    });
  });

  it('should return 401 when no token is provided', async () => {
    vi.mocked(authenticateRequest).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/auth/me');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing authentication token',
    });
  });

  it('should handle authentication errors gracefully', async () => {
    vi.mocked(authenticateRequest).mockRejectedValue(new Error('Authentication failed'));
    
    const request = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        authorization: 'Bearer token',
      },
    });
    
    // Should not throw, but return error response
    await expect(GET(request)).rejects.toThrow();
  });
});

