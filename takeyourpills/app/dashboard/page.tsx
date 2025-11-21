import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Dashboard Page
 * 
 * Main dashboard for authenticated users.
 * Displays medication tracking information.
 */

function DashboardContent() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Welcome to your medication tracking dashboard. Your medications will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

