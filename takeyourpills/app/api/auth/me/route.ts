import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { unauthorizedResponse } from '@/lib/auth/errors';

/**
 * GET /api/auth/me
 * 
 * Returns current authenticated user information.
 * Requires valid Bearer token in Authorization header.
 * 
 * Response:
 * {
 *   data: {
 *     id: string;
 *     email: string;
 *     timezone: string;
 *   }
 * }
 * 
 * Error Responses:
 * - 401 Unauthorized: Invalid or missing token
 */
export async function GET(request: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(request);

  if (!user) {
    return unauthorizedResponse('Invalid or missing authentication token');
  }

  // Return user information
  return Response.json({
    data: {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
    },
  });
}

