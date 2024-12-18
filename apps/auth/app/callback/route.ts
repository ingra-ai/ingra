import db from '@repo/db/client';
import { createActiveSession, expireMagicLinkByToken } from '@repo/shared/data/auth';
import { APP_AUTH_COOKIE_DOMAIN, APP_SESSION_COOKIE_NAME, HUBS_APP_URL } from '@repo/shared/lib/constants';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '';
  const token = searchParams.get('token') || '';

  if (type === 'magic' && token.length > 0) {
    const magicLinkWithUser = await db.magicLinkToken.findUnique({
      select: {
        token: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      where: {
        token,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!magicLinkWithUser) {
      return NextResponse.json(
        { error: 'Invalid token' },
        {
          status: 400,
        }
      );
    }

    const session = await createActiveSession(magicLinkWithUser.user);

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        {
          status: 500,
        }
      );
    }

    // Set session cookies
    const cookieStore = await cookies();
    cookieStore.set(APP_SESSION_COOKIE_NAME, session.jwt, {
      domain: APP_AUTH_COOKIE_DOMAIN,
      path: '/',
      sameSite: 'lax',
      expires: session.expiresAt,
      httpOnly: true,
      secure: true,
    });

    // Expire magic link so its token can't be used again
    await expireMagicLinkByToken(magicLinkWithUser.token);

    // Redirect to the app
    return NextResponse.redirect(HUBS_APP_URL, { status: 302 });
  } else {
    return NextResponse.json(
      { error: 'Invalid request' },
      {
        status: 400,
      }
    );
  }
}

// Notice the funciton definiton:
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    {
      status: 405,
    }
  );
}
