'use client';

/**
 * Protected Route Component
 * 
 * Wraps protected pages with authentication check.
 * Redirects to login if user is not authenticated.
 * Shows loading state while checking authentication.
 */

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { InteractionStatus } from '@azure/msal-browser';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Wrapper
 * 
 * Checks authentication status and either:
 * - Renders children if authenticated
 * - Redirects to login if not authenticated
 * - Shows loading state while checking
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for MSAL to finish initializing
    if (inProgress === InteractionStatus.None) {
      setIsChecking(false);

      // If not authenticated and not already on login page, redirect to login
      if (!isAuthenticated && pathname !== '/login') {
        // Preserve intended destination in query param
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      }
    }
  }, [isAuthenticated, inProgress, router, pathname]);

  // Show loading state while checking authentication or MSAL is initializing
  if (isChecking || inProgress !== InteractionStatus.None) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

