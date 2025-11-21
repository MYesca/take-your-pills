'use client';

/**
 * Session Provider Component
 * 
 * Monitors session status and handles session expiration.
 * Automatically redirects to login when session expires.
 * 
 * Note: MSAL handles token refresh automatically, so this component
 * primarily monitors for cases where authentication is lost.
 */

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { InteractionStatus } from '@azure/msal-browser';

interface SessionProviderProps {
  children: React.ReactNode;
}

/**
 * Session Provider
 * 
 * Monitors authentication status and handles session expiration.
 * This component should be used in the root layout to monitor
 * session across all pages.
 * 
 * MSAL automatically handles token refresh, so this component
 * primarily handles edge cases where authentication is lost.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, inProgress } = useMsal();
  const router = useRouter();
  const pathname = usePathname();
  const previousAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    // Wait for MSAL to finish initializing
    if (inProgress !== InteractionStatus.None) {
      return;
    }

    // Track previous authentication state
    const wasAuthenticated = previousAuthState.current;
    const isNowAuthenticated = isAuthenticated && accounts.length > 0;

    // Update previous state
    previousAuthState.current = isNowAuthenticated;

    // If user was authenticated but is no longer authenticated, and not on login page
    // This indicates session expiration or token invalidation
    if (
      wasAuthenticated === true &&
      !isNowAuthenticated &&
      pathname !== '/login' &&
      !pathname.startsWith('/api/')
    ) {
      // Redirect to login with session expired message
      const loginUrl = `/login?expired=true&redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, accounts, inProgress, router, pathname]);

  return <>{children}</>;
}

