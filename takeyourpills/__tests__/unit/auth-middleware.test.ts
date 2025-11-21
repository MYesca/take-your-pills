/**
 * Unit Tests for Authentication Middleware
 * 
 * Tests for token validation and authentication middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { validateToken, extractUserIdFromClaims, TokenClaims } from '@/lib/auth/msal-node';
import { prisma } from '@/lib/prisma/client';

// Mock dependencies
vi.mock('@/lib/auth/msal-node', () => ({
  validateToken: vi.fn(),
  extractUserIdFromClaims: vi.fn(),
}));

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('authenticateRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when Authorization header is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/test');
    
    const result = await authenticateRequest(request);
    
    expect(result).toBeNull();
    expect(validateToken).not.toHaveBeenCalled();
  });

  it('should return null when Authorization header does not start with Bearer', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Basic token123',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toBeNull();
    expect(validateToken).not.toHaveBeenCalled();
  });

  it('should return null when token is invalid', async () => {
    vi.mocked(validateToken).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toBeNull();
    expect(validateToken).toHaveBeenCalledWith('invalid-token');
  });

  it('should return authenticated user when token is valid and user exists', async () => {
    const mockClaims: TokenClaims = {
      oid: 'test-external-id-123',
      email: 'test@example.com',
    };
    
    vi.mocked(validateToken).mockResolvedValue(mockClaims);
    vi.mocked(extractUserIdFromClaims).mockReturnValue('test-external-id-123');
    
    const mockUser = {
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toEqual({
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
    });
    expect(validateToken).toHaveBeenCalledWith('valid-token');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { externalId: 'test-external-id-123' },
    });
  });

  it('should create user record when user does not exist', async () => {
    const mockClaims: TokenClaims = {
      oid: 'test-external-id-123',
      email: 'test@example.com',
    };
    
    vi.mocked(validateToken).mockResolvedValue(mockClaims);
    vi.mocked(extractUserIdFromClaims).mockReturnValue('test-external-id-123');
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    const mockNewUser = {
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    vi.mocked(prisma.user.create).mockResolvedValue(mockNewUser);
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toEqual({
      id: 'user-uuid-123',
      externalId: 'test-external-id-123',
      email: 'test@example.com',
      timezone: 'UTC',
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        externalId: 'test-external-id-123',
        email: 'test@example.com',
        timezone: 'UTC',
      },
    });
  });

  it('should update user email when email changed', async () => {
    const mockClaims: TokenClaims = {
      oid: 'test-external-id-123',
      email: 'newemail@example.com',
    };
    
    vi.mocked(validateToken).mockResolvedValue(mockClaims);
    vi.mocked(extractUserIdFromClaims).mockReturnValue('test-external-id-123');
    
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
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result?.email).toBe('newemail@example.com');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { externalId: 'test-external-id-123' },
      data: { email: 'newemail@example.com' },
    });
  });

  it('should return null when token claims missing user ID', async () => {
    const mockClaims: TokenClaims = {
      email: 'test@example.com',
      // Missing oid and sub
    };
    
    vi.mocked(validateToken).mockResolvedValue(mockClaims);
    vi.mocked(extractUserIdFromClaims).mockReturnValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return null when token claims missing email', async () => {
    const mockClaims: TokenClaims = {
      oid: 'test-external-id-123',
      // Missing email
    };
    
    vi.mocked(validateToken).mockResolvedValue(mockClaims);
    vi.mocked(extractUserIdFromClaims).mockReturnValue('test-external-id-123');
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    const mockClaims: TokenClaims = {
      oid: 'test-external-id-123',
      email: 'test@example.com',
    };
    
    vi.mocked(validateToken).mockResolvedValue(mockClaims);
    vi.mocked(extractUserIdFromClaims).mockReturnValue('test-external-id-123');
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'));
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    
    const result = await authenticateRequest(request);
    
    expect(result).toBeNull();
  });
});

