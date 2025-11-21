'use client';

/**
 * Login Content Component (Client Component)
 * 
 * Handles the actual login UI and logic.
 * Separated to allow Suspense boundary for useSearchParams.
 */

import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { InteractionStatus } from '@azure/msal-browser';

export default function LoginContent() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error or redirect param in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    
    // Check for session expired message
    const expiredParam = searchParams.get('expired');
    if (expiredParam === 'true') {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  // Handle redirect promise after OAuth callback
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await instance.handleRedirectPromise();
        if (response) {
          // User successfully authenticated
          // Extract ID token claims
          const idTokenClaims = response.idTokenClaims;
          
          if (idTokenClaims) {
            // Create or update user record in database
            try {
              const apiResponse = await fetch('/api/auth/callback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idTokenClaims }),
              });

              if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error?.message || 'Failed to create user record');
              }

              // User record created/updated successfully, redirect to intended destination or dashboard
              const redirectParam = searchParams.get('redirect');
              const destination = redirectParam ? decodeURIComponent(redirectParam) : '/';
              router.push(destination);
            } catch (err) {
              console.error('User record creation error:', err);
              setError(err instanceof Error ? err.message : 'Failed to create user account');
            }
          }
        }
      } catch (err) {
        console.error('Redirect handling error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    if (inProgress === InteractionStatus.None) {
      handleRedirect();
    }
  }, [instance, inProgress, router]);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0 && inProgress === InteractionStatus.None) {
      // User is already authenticated, redirect to intended destination or dashboard
      const redirectParam = searchParams.get('redirect');
      const destination = redirectParam ? decodeURIComponent(redirectParam) : '/';
      router.push(destination);
    }
  }, [isAuthenticated, accounts, inProgress, router, searchParams]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use loginRedirect for better UX (no popup blocker issues)
      await instance.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
      });
      // Note: loginRedirect will navigate away, so we won't reach here
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during login';
      setError(errorMessage);
      console.error('Login error:', err);
    }
  };

  // Show loading state while checking authentication or processing redirect
  if (inProgress !== InteractionStatus.None || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't show login page if already authenticated (redirect will happen)
  if (isAuthenticated && accounts.length > 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            TakeYourPills
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Sign in to track your medications
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <p className="font-medium">Authentication Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Signing in...</span>
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          {error && (
            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

