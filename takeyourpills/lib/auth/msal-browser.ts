/**
 * MSAL Browser Configuration (Client-Side Only)
 * 
 * This file configures MSAL for frontend (React) only.
 * It should only be imported in client components.
 */

import { 
  PublicClientApplication, 
  Configuration as MSALConfiguration,
  LogLevel 
} from '@azure/msal-browser';

/**
 * MSAL Configuration for Frontend (React)
 * Uses PublicClientApplication for browser-based authentication
 */
const msalConfig: MSALConfiguration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: `https://omotorciam.ciamlogin.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || ''}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : ''),
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage instead of localStorage for better security
    storeAuthStateInCookie: false, // Set to true if you have issues with IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MSAL] ${level}: ${message}`);
        }
      },
      logLevel: process.env.NODE_ENV === 'development' ? LogLevel.Verbose : LogLevel.Error,
    },
  },
};

/**
 * MSAL Public Client Application Instance (Frontend)
 * This is used in React components for authentication flows
 */
let msalInstance: PublicClientApplication | null = null;

/**
 * Get or create MSAL instance for frontend
 * Creates a singleton instance to avoid multiple initializations
 */
export function getMsalInstance(): PublicClientApplication {
  if (typeof window === 'undefined') {
    throw new Error('MSAL instance can only be created in browser environment');
  }

  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    msalInstance.initialize();
  }

  return msalInstance;
}

/**
 * MSAL Configuration Export
 * Exports configuration for use in other parts of the application
 */
export const msalConfiguration = msalConfig;

