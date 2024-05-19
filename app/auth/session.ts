'use server';
import { cookies } from 'next/headers';
import { type User, type Profile, type ActiveSession, type OAuthToken } from '@prisma/client';
import { APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { Logger } from '@lib/logger';
import { getUserByJwt } from '@/data/user';
import { kv } from '@vercel/kv';

const AUTH_SESSION_REDIS_EXPIRY = 3600 * 24; // 24 hour

export type AuthSessionResponse = Pick<ActiveSession, 'expiresAt'> & {
  user: Pick<User, 'email' | 'role' | 'id'> & {
    profile: Profile | null;
    oauthTokens: OAuthToken[];
  };
};

export const getAuthSession = async (): Promise<AuthSessionResponse | null> => {
  const cookieStore = cookies();
  const jwtCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);

  if (!jwtCookie || !jwtCookie.value) {
    return null;
  }

  const redisKey = `session:${jwtCookie.value}`

  try {
    // Attempt to get the session from Redis
    const cachedSession = await kv.get<AuthSessionResponse>(redisKey);

    if (cachedSession) {
      // Parse and return the cached session
      const sessionWithUser = cachedSession;
      
      // Check if the session has expired
      if (new Date(sessionWithUser.expiresAt) < new Date()) {
        Logger.withTag('AuthSession').info('Session expired');
        return null; // Session expired
      }

      // Extend the token expiry time in Redis and update the expiresAt field
      const newExpiryDate = new Date();
      newExpiryDate.setSeconds(newExpiryDate.getSeconds() + AUTH_SESSION_REDIS_EXPIRY);

      sessionWithUser.expiresAt = newExpiryDate;

      // Extend the token expiry time in Redis
      await kv.expire(redisKey, AUTH_SESSION_REDIS_EXPIRY); // Set expiry to 1 hour (3600 seconds), adjust as needed

      return sessionWithUser;
    }

    // Retrieve the active session along with the user data in a single query
    const sessionWithUser = await getUserByJwt(jwtCookie.value);

    // Check if a session was found
    if ( !sessionWithUser || sessionWithUser.expiresAt < new Date() ) {
      Logger.withTag('AuthSession').info('Session not found or expired');
      return null; // Or handle this case as needed
    }

    // Set the initial expiresAt field
    const newExpiryDate = new Date();
    newExpiryDate.setSeconds(newExpiryDate.getSeconds() + AUTH_SESSION_REDIS_EXPIRY);

    sessionWithUser.expiresAt = newExpiryDate;

    // Store the session in Redis with an expiry time
    await kv.set(redisKey, JSON.stringify(sessionWithUser), {
      ex: AUTH_SESSION_REDIS_EXPIRY // Set expiry to 1 hour (3600 seconds), adjust as needed
    });

    return sessionWithUser;
  } catch (error) {
    Logger.withTag('AuthSession').error('Error fetching user and session by JWT:', error);
    return null;
  }
};
