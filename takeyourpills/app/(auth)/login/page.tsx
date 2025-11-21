import { Suspense } from 'react';
import LoginContent from './login-content';

/**
 * Login Page Component
 * 
 * Wraps LoginContent in Suspense boundary for useSearchParams.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

