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
 * Token Validation Utility
 * 
 * Validates JWT tokens from Microsoft Entra External ID.
 * Verifies token signature, expiration, audience, and issuer.
 * 
 * @param token - The access token to validate
 * @returns Token claims if valid, null if invalid
 */
export interface TokenClaims {
  sub?: string;
  oid?: string;
  email?: string;
  aud?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export async function validateToken(token: string): Promise<TokenClaims | null> {
  try {
    if (!token) {
      return null;
    }

    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    
    // Get authority URL for JWKS endpoint
    const authority = msalNodeConfig.auth.authority;
    const tenantId = process.env.AZURE_TENANT_ID || '';
    const clientId = process.env.AZURE_CLIENT_ID || '';
    
    if (!authority || !tenantId || !clientId) {
      console.error('MSAL configuration missing required environment variables');
      return null;
    }

    // Construct JWKS URI for Microsoft Entra External ID
    // For CIAM, the JWKS endpoint is typically at: {authority}/discovery/v2.0/keys
    const jwksUri = `${authority}/discovery/v2.0/keys`;
    
    // Create JWKS remote set for signature verification
    const JWKS = createRemoteJWKSet(new URL(jwksUri));

    // Verify token signature and decode claims
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authority,
      audience: clientId, // Token audience should match client ID
    });

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('Token has expired');
      return null;
    }

    // Return token claims
    return payload as TokenClaims;
  } catch (error) {
    // Log error without sensitive data
    if (error instanceof Error) {
      console.error('Token validation error:', error.message);
    } else {
      console.error('Token validation error: Unknown error');
    }
    return null;
  }
}

/**
 * Extract User ID from Token Claims
 * 
 * Extracts the user's external ID from validated token claims.
 * Uses 'oid' (object ID) or 'sub' (subject) claim.
 * 
 * @param claims - The validated token claims
 * @returns User ID (external ID from Microsoft Entra) or null
 */
export function extractUserIdFromClaims(claims: TokenClaims | null): string | null {
  if (!claims) {
    return null;
  }

  // Prefer 'oid' (object ID) over 'sub' (subject) for Microsoft Entra
  // 'oid' is the immutable user identifier
  return claims.oid || claims.sub || null;
}

/**
 * MSAL Node Configuration Export
 * Exports configuration for use in other parts of the application
 */
export const msalNodeConfiguration = msalNodeConfig;

