'use server';
import { APP_SESSION_COOKIE_NAME } from '@repo/shared/lib/constants';
import { cookies } from 'next/headers';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import db from '@repo/db/client';
import { Logger } from '@repo/shared/lib/logger';
import { clearAuthCaches } from '@repo/shared/data/auth/session/caches';
import { NextRequest } from 'next/server';
import { censorEmail } from '@repo/shared/lib/utils';
import { redirect, RedirectType } from 'next/navigation';
import { getAuthSession } from '@repo/shared/data/auth/session';

export async function GET(request: NextRequest) {
  const jwtCookie = request.cookies.get(APP_SESSION_COOKIE_NAME);
  const authSession = await getAuthSession();

  if (authSession && jwtCookie?.value) {
    try {
      // Update db to remove active session
      const expireActiveSession = db.activeSession.update({
        where: {
          jwt: jwtCookie.value,
          userId: authSession?.userId,
        },
        data: {
          expiresAt: new Date(0),
        },
      });

      // Remove session cookies
      const cookieStore = cookies();
      cookieStore.delete(APP_SESSION_COOKIE_NAME);
      request.cookies.delete(APP_SESSION_COOKIE_NAME);

      await Promise.all([expireActiveSession, clearAuthCaches(authSession)]);

      Logger.withTag('action|logout').info(`${censorEmail(authSession.user.email)} has logged out.`);
    } catch (error: any) {
      Logger.withTag('action|logout').error('Error removing session due to logout', { jwt: jwtCookie.value, error });
    }
  }

  // Redirect to the app
  redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
}
