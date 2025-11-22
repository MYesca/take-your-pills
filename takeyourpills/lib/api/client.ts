'use client';

/**
 * API Client Utility
 * 
 * Provides a fetch wrapper that handles authentication tokens and 401 responses.
 * Automatically includes Bearer token from MSAL and redirects to login on 401.
 */

import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';

/**
 * API Client Options
 */
interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  requireAuth?: boolean; // Whether to include auth token (default: true)
}

/**
 * API Client Response
 */
interface ApiClientResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Create API client function
 * 
 * Returns a function that can be used to make authenticated API requests.
 * The function automatically includes the Bearer token and handles 401 responses.
 * 
 * @returns API client function
 */
export function createApiClient() {
  // This will be used in React components
  // For now, we'll create a utility that can be used with hooks
  return {
    /**
     * Make an authenticated API request
     * 
     * @param url - API endpoint URL
     * @param options - Request options
     * @returns Response data or throws error
     */
    async request<T = unknown>(
      url: string,
      options: ApiClientOptions = {}
    ): Promise<T> {
      const { method = 'GET', headers = {}, body, requireAuth = true } = options;

      // Get access token from MSAL (this will be called from React component)
      // For now, we'll create a hook-based version
      throw new Error('Use useApiClient hook in React components');
    },
  };
}

/**
 * API Client Hook
 * 
 * React hook that provides authenticated API client with automatic token handling.
 * 
 * Usage:
 * ```tsx
 * const api = useApiClient();
 * const data = await api.get('/api/medications');
 * ```
 */
export function useApiClient() {
  const { instance, accounts } = useMsal();
  const router = useRouter();

  /**
   * Get access token from MSAL
   */
  const getAccessToken = async (): Promise<string | null> => {
    try {
      if (accounts.length === 0) {
        return null;
      }

      // Get token silently from MSAL cache
      const account = accounts[0];
      const response = await instance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account,
      });

      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire access token:', error);
      return null;
    }
  };

  /**
   * Handle 401 Unauthorized response
   */
  const handleUnauthorized = (isExpired: boolean = false) => {
    // Clear any stored authentication state
    // MSAL handles this automatically, but we can trigger logout if needed
    
    // Redirect to login page with appropriate message
    const loginUrl = isExpired ? '/login?expired=true' : '/login';
    router.push(loginUrl);
  };

  /**
   * Make an authenticated API request
   */
  const request = async <T = unknown>(
    url: string,
    options: ApiClientOptions = {}
  ): Promise<T> => {
    const { method = 'GET', headers = {}, body, requireAuth = true } = options;

    // Get access token if authentication is required
    let authHeader = '';
    if (requireAuth) {
      const token = await getAccessToken();
      if (!token) {
        handleUnauthorized();
        throw new Error('Not authenticated');
      }
      authHeader = `Bearer ${token}`;
    }

    // Make request
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...headers,
      },
    };

    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestInit);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      const isExpired = errorData.error?.code === 'TOKEN_EXPIRED' || errorData.error?.code === 'SESSION_EXPIRED';
      handleUnauthorized(isExpired);
      throw new Error(errorData.error?.message || 'Authentication required');
    }

    // Parse response
    const data: ApiClientResponse<T> = await response.json();

    // Handle errors
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Request failed with status ${response.status}`);
    }

    // Return data
    return data.data as T;
  };

  return {
    /**
     * GET request
     */
    get: <T = unknown>(url: string, options?: Omit<ApiClientOptions, 'method'>) =>
      request<T>(url, { ...options, method: 'GET' }),

    /**
     * POST request
     */
    post: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
      request<T>(url, { ...options, method: 'POST', body }),

    /**
     * PUT request
     */
    put: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
      request<T>(url, { ...options, method: 'PUT', body }),

    /**
     * DELETE request
     */
    delete: <T = unknown>(url: string, options?: Omit<ApiClientOptions, 'method'>) =>
      request<T>(url, { ...options, method: 'DELETE' }),

    /**
     * PATCH request
     */
    patch: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiClientOptions, 'method' | 'body'>) =>
      request<T>(url, { ...options, method: 'PATCH', body }),
  };
}

