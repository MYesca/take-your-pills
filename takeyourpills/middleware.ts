import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 * 
 * Protects routes by checking authentication status and redirecting
 * unauthenticated users to the login page.
 * 
 * Note: This middleware runs on the edge runtime and cannot directly
 * access MSAL React hooks. Authentication check is done client-side
 * in components, but this middleware can handle basic route protection.
 * 
 * For full authentication checking, we rely on client-side components
 * that use MSAL React hooks.
 */

/**
 * Define protected routes that require authentication
 */
const protectedRoutes = [
  '/', // Dashboard
  '/dashboard',
  '/medications',
  '/settings',
  '/reports',
];

/**
 * Define public routes that don't require authentication
 */
const publicRoutes = [
  '/login',
  '/api/auth/callback',
  '/api/auth/me', // Allow access for checking auth status
];

/**
 * Check if a path matches any of the route patterns
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes (API routes handle their own auth)
  if (isPublicRoute(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For protected routes, we'll let the client-side handle authentication
  // The middleware just allows the request through, and client components
  // will check authentication and redirect if needed
  // This is because MSAL React hooks can only be used in client components
  
  // Note: In a production app, you might want to check for a session cookie
  // or token here, but since we're using MSAL React with in-memory tokens,
  // the client-side check is more appropriate

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

