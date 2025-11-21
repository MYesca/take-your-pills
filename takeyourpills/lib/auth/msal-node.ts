/**
 * MSAL Node Configuration (Server-Side Only)
 * 
 * This file configures MSAL for backend (Node.js) only.
 * It should only be imported in server components, API routes, or server actions.
 */

import { 
  ConfidentialClientApplication, 
  Configuration as MSALNodeConfiguration,
  LogLevel as MSALNodeLogLevel 
} from '@azure/msal-node';

/**
 * MSAL Configuration for Backend (Node.js)
 * Uses ConfidentialClientApplication for server-side token validation
 */
const msalNodeConfig: MSALNodeConfiguration = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    authority: `https://omotorciam.ciamlogin.com/${process.env.AZURE_TENANT_ID || ''}`,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MSAL Node] ${level}: ${message}`);
        }
      },
      logLevel: process.env.NODE_ENV === 'development' ? MSALNodeLogLevel.Verbose : MSALNodeLogLevel.Error,
    },
  },
};

/**
 * MSAL Confidential Client Application Instance (Backend)
 * This is used in API routes for token validation
 */
let msalNodeInstance: ConfidentialClientApplication | null = null;

/**
 * Get or create MSAL Node instance for backend
 * Creates a singleton instance to avoid multiple initializations
 */
export function getMsalNodeInstance(): ConfidentialClientApplication {
  if (!msalNodeInstance) {
    msalNodeInstance = new ConfidentialClientApplication(msalNodeConfig);
  }

  return msalNodeInstance;
}

/**
 * Token Validation Utility (Basic Structure)
 * 
 * This is a basic structure for token validation.
 * Full implementation will be completed in Epic 2 (Story 2.2).
 * 
 * @param token - The access token to validate
 * @returns User ID extracted from token claims, or null if invalid
 */
export async function validateToken(token: string): Promise<string | null> {
  try {
    // TODO: Implement full token validation in Epic 2, Story 2.2
    // This will include:
    // 1. Verify token signature
    // 2. Check token expiration
    // 3. Validate token audience and issuer
    // 4. Extract user ID from token claims (oid or sub claim)
    
    const msalNode = getMsalNodeInstance();
    
    // Basic structure - full implementation in Epic 2
    // For now, return null to indicate validation is not yet implemented
    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

/**
 * Extract User ID from Token Claims
 * 
 * Helper function to extract user ID from validated token.
 * Full implementation will be in Epic 2.
 * 
 * @param token - The validated access token
 * @returns User ID (external ID from Microsoft Entra) or null
 */
export function extractUserIdFromToken(token: string): string | null {
  try {
    // TODO: Implement in Epic 2, Story 2.2
    // Extract 'oid' or 'sub' claim from token
    // This is the user's external ID from Microsoft Entra
    return null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

/**
 * MSAL Node Configuration Export
 * Exports configuration for use in other parts of the application
 */
export const msalNodeConfiguration = msalNodeConfig;

