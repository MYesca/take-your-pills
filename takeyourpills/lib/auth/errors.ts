import { NextResponse } from 'next/server';

/**
 * Standard 401 Unauthorized Response
 * 
 * Creates a standard error response for authentication failures.
 * Follows the Architecture error response format.
 * 
 * @param message - User-friendly error message
 * @param code - Error code (default: 'UNAUTHORIZED')
 * @returns NextResponse with 401 status and error format
 */
export function unauthorizedResponse(
  message: string = 'Authentication required',
  code: string = 'UNAUTHORIZED'
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status: 401 }
  );
}

/**
 * Standard Error Response
 * 
 * Creates a standard error response following Architecture format.
 * 
 * @param code - Error code
 * @param message - User-friendly error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional error details
 * @returns NextResponse with error format
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

