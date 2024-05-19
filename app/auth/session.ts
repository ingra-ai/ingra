'use server';
import { cookies, headers } from 'next/headers';
import { type User, type Profile, type ActiveSession, type OAuthToken, type EnvVars } from '@prisma/client';
import { APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { Logger } from '@lib/logger';
import { getUserByApiKey, getUserByJwt } from '@/data/user';

export type AuthSessionResponse = {
  expiresAt?: Date;
} & {
  user: Pick<User, 'email' | 'role' | 'id'> & {
    profile: Profile | null;
    oauthTokens: OAuthToken[];
    envVars: EnvVars[];
  };
};

export const getAuthSession = async (): Promise<AuthSessionResponse | null> => {
  const cookieStore = cookies();
  const headersList = headers()
  const jwtCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);
  const xApiKey = headersList.get('X-API-KEY')

  if (!jwtCookie || !jwtCookie.value) {
    return null;
  }

  try {
    let sessionWithUser: AuthSessionResponse | null = null;

    if ( jwtCookie && jwtCookie.value ) {
      sessionWithUser = await getUserByJwt(jwtCookie.value);

      // Check if a session was found
      if (!sessionWithUser || (sessionWithUser?.expiresAt && sessionWithUser.expiresAt < new Date())) {
        Logger.withTag('AuthSession').info('Session not found or expired');
        return null; // Or handle this case as needed
      }
    }
    else if ( xApiKey ) {
      sessionWithUser = await getUserByApiKey(xApiKey);
    }

    return sessionWithUser;
  } catch (error) {
    Logger.withTag('AuthSession').error('Error fetching user and session by either JWT or API key:', error);
    return null;
  }
};
