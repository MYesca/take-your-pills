/**
 * Integration Tests for Authentication Flow
 * 
 * Tests for OAuth callback handler and user record creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/callback/route';
import { prisma } from '@/lib/prisma/client';

// Mock Prisma Client
vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('OAuth Callback Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new user record when user does not exist', async () => {
    const mockIdTokenClaims = {
      sub: 'test-external-id-123',
      oid: 'test-external-id-123',
      email: 'test@example.com',
    };

    // Mock user doesn't exist
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    // Mock user creation
    const mockUser = {
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ idTokenClaims: mockIdTokenClaims }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toMatchObject({
      id: 'user-uuid-123',
      email: 'test@example.com',
      timezone: 'UTC',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { externalId: 'test-external-id-123' },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        externalId: 'test-external-id-123',
        email: 'test@example.com',
        timezone: 'UTC',
      },
    });
  });

  it('should return existing user when user already exists', async () => {
    const mockIdTokenClaims = {
      sub: 'test-external-id-123',
      oid: 'test-external-id-123',
      email: 'test@example.com',
    };

    const mockUser = {
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock user exists
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const request = new NextRequest('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ idTokenClaims: mockIdTokenClaims }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toMatchObject({
      id: 'user-uuid-123',
      email: 'test@example.com',
      timezone: 'UTC',
    });
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should update user email if email changed', async () => {
    const mockIdTokenClaims = {
      sub: 'test-external-id-123',
      oid: 'test-external-id-123',
      email: 'newemail@example.com',
    };

    const existingUser = {
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'oldemail@example.com',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser = {
      ...existingUser,
      email: 'newemail@example.com',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);

    const request = new NextRequest('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ idTokenClaims: mockIdTokenClaims }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.email).toBe('newemail@example.com');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { externalId: 'test-external-id-123' },
      data: { email: 'newemail@example.com' },
    });
  });

  it('should return 400 error when idTokenClaims is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('MISSING_TOKEN_CLAIMS');
  });

  it('should return 400 error when required fields are missing', async () => {
    const mockIdTokenClaims = {
      sub: 'test-external-id-123',
      // email missing
    };

    const request = new NextRequest('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ idTokenClaims: mockIdTokenClaims }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_TOKEN_CLAIMS');
  });

  it('should handle database errors gracefully', async () => {
    const mockIdTokenClaims = {
      sub: 'test-external-id-123',
      email: 'test@example.com',
    };

    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ idTokenClaims: mockIdTokenClaims }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });
});

