'use server';
import { APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { cookies } from 'next/headers';
import { APP_AUTH_LOGIN_URL } from '@lib/constants';
import { RedirectType, redirect } from 'next/navigation';
import db from '@lib/db';
import { kv } from '@vercel/kv';
import { Logger } from '@lib/logger';

export async function GET() {
  const cookieStore = cookies();
  const jwtCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);

  if (jwtCookie?.value) {
    // Update db to remove active session
    await db.activeSession.update({
      where: {
        jwt: jwtCookie.value,
      },
      data: {
        expiresAt: new Date(0),
      },
    });

    // Remove from redis
    kv.del('activeSession:' + jwtCookie.value);
    Logger.withTag('kv').info('Session removed due to logout', { jwt: jwtCookie.value });

    // Remove session cookies
    cookieStore.delete(APP_SESSION_COOKIE_NAME);
  }

  redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
}
