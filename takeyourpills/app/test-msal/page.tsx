'use client';

/**
 * MSAL Configuration Test Page
 * 
 * This page helps verify that MSAL is properly configured.
 * It displays configuration status and allows testing MSAL instance creation.
 */

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';

export default function TestMsalPage() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [configStatus, setConfigStatus] = useState<{
    clientId: boolean;
    tenantId: boolean;
    redirectUri: boolean;
    authority: string | null;
    instanceCreated: boolean;
    error: string | null;
  }>({
    clientId: false,
    tenantId: false,
    redirectUri: false,
    authority: null,
    instanceCreated: false,
    error: null,
  });

  const [backendStatus, setBackendStatus] = useState<{
    loading: boolean;
    success: boolean | null;
    config: {
      clientId: string;
      clientSecret: string;
      tenantId: string;
      authority: string;
      instanceCreated: boolean;
    } | null;
    error: string | null;
  }>({
    loading: false,
    success: null,
    config: null,
    error: null,
  });

  useEffect(() => {
    // Check configuration status by examining MSAL instance
    let clientId = false;
    let tenantId = false;
    let redirectUri = false;
    let authority: string | null = null;
    let instanceCreated = false;
    let error: string | null = null;

    try {
      // Try to get MSAL configuration
      if (instance) {
        const config = instance.getConfiguration();
        authority = config.auth.authority || null;
        
        // Check if configuration values are present
        clientId = !!config.auth.clientId && config.auth.clientId !== '';
        tenantId = !!authority && authority.includes('/');
        redirectUri = !!config.auth.redirectUri && config.auth.redirectUri !== '';
        
        instanceCreated = true;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      instanceCreated = false;
    }

    // Test utility page - intentional synchronous state updates for configuration display
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfigStatus({
      clientId,
      tenantId,
      redirectUri,
      authority,
      instanceCreated,
      error,
    });
  }, [instance]);

  useEffect(() => {
    // Test backend MSAL Node configuration
    const testBackend = async () => {
      setBackendStatus(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch('/api/test-msal');
        const data = await response.json();
        
        if (data.success) {
          setBackendStatus({
            loading: false,
            success: true,
            config: data.config,
            error: null,
          });
        } else {
          setBackendStatus({
            loading: false,
            success: false,
            config: data.config,
            error: data.error || data.message,
          });
        }
      } catch (err) {
        setBackendStatus({
          loading: false,
          success: false,
          config: null,
          error: err instanceof Error ? err.message : 'Failed to test backend configuration',
        });
      }
    };

    testBackend();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black dark:text-zinc-50">
          MSAL Configuration Test
        </h1>

        <div className="space-y-6">
          {/* Configuration Status */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Configuration Status
            </h2>
            <div className="space-y-2">
              <ConfigItem
                label="Client ID"
                status={configStatus.clientId}
                value={configStatus.clientId ? '✓ Configured' : '✗ Missing'}
              />
              <ConfigItem
                label="Tenant ID"
                status={configStatus.tenantId}
                value={configStatus.tenantId ? '✓ Configured' : '✗ Missing'}
              />
              <ConfigItem
                label="Redirect URI"
                status={configStatus.redirectUri}
                value={configStatus.redirectUri ? '✓ Configured' : 'Using window.location.origin'}
              />
              <ConfigItem
                label="Authority"
                status={!!configStatus.authority}
                value={configStatus.authority || 'Not configured'}
              />
              <ConfigItem
                label="MSAL Instance"
                status={configStatus.instanceCreated}
                value={configStatus.instanceCreated ? '✓ Created successfully' : '✗ Failed to create'}
              />
              {configStatus.error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {configStatus.error}
                </div>
              )}
            </div>
          </section>

          {/* Authentication Status */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Authentication Status
            </h2>
            <div className="space-y-2">
              <ConfigItem
                label="Is Authenticated"
                status={isAuthenticated}
                value={isAuthenticated ? '✓ Yes' : '✗ No'}
              />
              <ConfigItem
                label="Active Accounts"
                status={accounts.length > 0}
                value={accounts.length > 0 ? `${accounts.length} account(s)` : 'No accounts'}
              />
              {accounts.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <strong className="text-blue-800 dark:text-blue-200">Account Details:</strong>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    {accounts.map((account, index) => (
                      <li key={index}>
                        <strong>Username:</strong> {account.username}<br />
                        <strong>Home Account ID:</strong> {account.homeAccountId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Backend Configuration Status */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Backend (MSAL Node) Configuration
            </h2>
            {backendStatus.loading ? (
              <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
            ) : backendStatus.config ? (
              <div className="space-y-2">
                <ConfigItem
                  label="Client ID"
                  status={backendStatus.config.clientId.includes('✓')}
                  value={backendStatus.config.clientId}
                />
                <ConfigItem
                  label="Client Secret"
                  status={backendStatus.config.clientSecret.includes('✓')}
                  value={backendStatus.config.clientSecret}
                />
                <ConfigItem
                  label="Tenant ID"
                  status={backendStatus.config.tenantId.includes('✓')}
                  value={backendStatus.config.tenantId}
                />
                <ConfigItem
                  label="Authority"
                  status={!!backendStatus.config.authority && backendStatus.config.authority !== 'Not configured'}
                  value={backendStatus.config.authority}
                />
                <ConfigItem
                  label="MSAL Node Instance"
                  status={backendStatus.config.instanceCreated}
                  value={backendStatus.config.instanceCreated ? '✓ Created successfully' : '✗ Failed to create'}
                />
                {backendStatus.error && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {backendStatus.error}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-zinc-600 dark:text-zinc-400">Failed to load backend configuration</div>
            )}
          </section>

          {/* Test Actions */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Test Results
            </h2>
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400">
                Note: Full login functionality will be implemented in Epic 2. 
                This page only verifies that MSAL is properly configured.
              </p>
              {configStatus.instanceCreated && backendStatus.success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-200">
                  ✓ Both frontend and backend MSAL instances are ready. Configuration test passed!
                </div>
              )}
              {(!configStatus.instanceCreated || !backendStatus.success) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-200">
                  ⚠ Some configuration issues detected. Please check the status above.
                </div>
              )}
            </div>
          </section>

          {/* Next Steps */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
              Next Steps
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>If all configuration items show ✓, MSAL is properly configured</li>
              <li>If any items show ✗, check your .env.local file</li>
              <li>Verify that your Azure App Registration redirect URI matches NEXT_PUBLIC_AZURE_REDIRECT_URI</li>
              <li>Full authentication flows will be implemented in Epic 2 (Story 2.1)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

interface ConfigItemProps {
  label: string;
  status: boolean;
  value: string;
}

function ConfigItem({ label, status, value }: ConfigItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}:</span>
      <span
        className={`font-mono text-sm ${
          status
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

