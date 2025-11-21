'use client';

/**
 * Home/Dashboard Page
 * 
 * Main dashboard for authenticated users.
 * Protected route that requires authentication.
 */

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useApiClient } from '@/lib/api/client';
import { useEffect, useState } from 'react';

function DashboardContent() {
  const api = useApiClient();
  const [user, setUser] = useState<{ id: string; email: string; timezone: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current user information
    const fetchUser = async () => {
      try {
        const userData = await api.get<{ id: string; email: string; timezone: string }>('/api/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Error handling is done by API client (redirects to login on 401)
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [api]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          {user && (
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Welcome, <span className="font-semibold text-zinc-900 dark:text-zinc-50">{user.email}</span>!
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Your medications will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
