import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

/**
 * OAuth Callback Handler - User Record Creation/Update
 * 
 * This endpoint is called after MSAL React successfully authenticates the user on the client side.
 * It receives the ID token claims and creates/updates the user record in the database.
 * 
 * Note: MSAL React handles the OAuth redirect flow automatically on the client side.
 * This API route is only for processing the authenticated user information.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idTokenClaims } = body;

    if (!idTokenClaims) {
      return NextResponse.json(
        { error: { code: 'MISSING_TOKEN_CLAIMS', message: 'ID token claims are required' } },
        { status: 400 }
      );
    }

    // Extract user information from token claims
    const externalId = idTokenClaims.sub || idTokenClaims.oid;
    const email = idTokenClaims.email;

    if (!externalId || !email) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN_CLAIMS', message: 'Missing required user information in token' } },
        { status: 400 }
      );
    }

    // Check if user exists, create or update
    let user = await prisma.user.findUnique({
      where: { externalId },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          externalId,
          email,
          timezone: 'UTC', // Default timezone
        },
      });
    } else if (user.email !== email) {
      // Update email if changed
      user = await prisma.user.update({
        where: { externalId },
        data: { email },
      });
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error('User creation/update error:', error);
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: 'Failed to create or update user record' } },
      { status: 500 }
    );
  }
}

