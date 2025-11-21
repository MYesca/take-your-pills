'use client';

/**
 * MSAL Provider Component for Next.js 16 App Router
 * 
 * This is a client component that wraps the application with MSAL React's MsalProvider.
 * It must be a client component because MSAL React hooks can only be used in client components.
 */

import { MsalProvider } from '@azure/msal-react';
import { getMsalInstance } from '@/lib/auth/msal-browser';
import { ReactNode, useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

interface MsalProviderWrapperProps {
  children: ReactNode;
}

/**
 * MSAL Provider Wrapper
 * 
 * Wraps the application with MSAL React's MsalProvider.
 * This enables MSAL authentication hooks throughout the application.
 * 
 * Note: MSAL instance is only created on the client side to avoid SSR issues.
 */
export function MsalProviderWrapper({ children }: MsalProviderWrapperProps) {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    // Only create MSAL instance on the client side
    if (typeof window !== 'undefined') {
      try {
        const instance = getMsalInstance();
        setMsalInstance(instance);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      }
    }
  }, []);

  // Don't render MSAL provider until instance is created
  if (!msalInstance) {
    return <>{children}</>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}

