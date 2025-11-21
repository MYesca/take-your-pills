import { NextResponse } from 'next/server';
import { getMsalNodeInstance, msalNodeConfiguration } from '@/lib/auth/msal-node';

/**
 * Test MSAL Node Configuration API Route
 * 
 * This endpoint tests that the backend MSAL Node configuration is working.
 * It verifies that ConfidentialClientApplication can be instantiated.
 */

export async function GET() {
  try {
    // Test MSAL Node instance creation
    const msalNodeInstance = getMsalNodeInstance();
    
    // Check if required environment variables are set
    const clientId = !!process.env.AZURE_CLIENT_ID;
    const clientSecret = !!process.env.AZURE_CLIENT_SECRET;
    const tenantId = !!process.env.AZURE_TENANT_ID;
    
    // Use the exported configuration (MSAL Node doesn't have getConfiguration() method)
    const authority = msalNodeConfiguration.auth.authority || 'Not configured';
    
    // Verify instance was created successfully by checking it's not null
    if (!msalNodeInstance) {
      throw new Error('MSAL Node instance is null');
    }
    
    return NextResponse.json({
      success: true,
      message: 'MSAL Node configuration is valid',
      config: {
        clientId: clientId ? '✓ Configured' : '✗ Missing',
        clientSecret: clientSecret ? '✓ Configured' : '✗ Missing',
        tenantId: tenantId ? '✓ Configured' : '✗ Missing',
        authority: authority,
        instanceCreated: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create MSAL Node instance',
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          clientId: !!process.env.AZURE_CLIENT_ID ? '✓ Configured' : '✗ Missing',
          clientSecret: !!process.env.AZURE_CLIENT_SECRET ? '✓ Configured' : '✗ Missing',
          tenantId: !!process.env.AZURE_TENANT_ID ? '✓ Configured' : '✗ Missing',
          authority: msalNodeConfiguration.auth.authority || 'Not configured',
          instanceCreated: false,
        },
      },
      { status: 500 }
    );
  }
}

