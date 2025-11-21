import { NextRequest } from 'next/server';
import { validateToken, extractUserIdFromClaims, TokenClaims } from '@/lib/auth/msal-node';
import { prisma } from '@/lib/prisma/client';

/**
 * Authenticated User Context
 * 
 * Represents an authenticated user for use in API routes.
 */
export interface AuthenticatedUser {
  id: string;
  externalId: string;
  email: string;
  timezone: string;
}

/**
 * Authentication Middleware
 * 
 * Validates Bearer tokens from API requests and provides authenticated user context.
 * 
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate token using MSAL Node
 * 3. Extract user ID from token claims
 * 4. Look up user in database by externalId
 * 5. Create user record if doesn't exist (first login scenario)
 * 6. Return authenticated user context or null if validation fails
 * 
 * @param request - Next.js request object
 * @returns Authenticated user context or null if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (!token) {
      return null;
    }

    // Validate token using MSAL Node
    const claims = await validateToken(token);
    if (!claims) {
      return null;
    }

    // Extract user ID from token claims
    const externalId = extractUserIdFromClaims(claims);
    if (!externalId) {
      console.error('Token claims missing user ID (oid or sub)');
      return null;
    }

    // Extract email from token claims
    const email = claims.email;
    if (!email) {
      console.error('Token claims missing email');
      return null;
    }

    // Look up user in database by externalId
    let user = await prisma.user.findUnique({
      where: { externalId },
    });

    // Create user record if doesn't exist (first login via API scenario)
    if (!user) {
      user = await prisma.user.create({
        data: {
          externalId,
          email,
          timezone: 'UTC', // Default timezone
        },
      });
    } else if (user.email !== email) {
      // Update email if changed
      user = await prisma.user.update({
        where: { externalId },
        data: { email },
      });
    }

    // Return authenticated user context
    return {
      id: user.id,
      externalId: user.externalId,
      email: user.email,
      timezone: user.timezone,
    };
  } catch (error) {
    // Log error without sensitive data
    console.error('Authentication middleware error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

