"use server"
import { cookies } from 'next/headers';
import { type User, type Profile, type ActiveSession, type PhraseCode } from "@prisma/client";
import { APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { Logger } from '@lib/logger';
import { getUserByJwt } from '@/data/user';

export type AuthSessionResponse = Pick<ActiveSession, 'expiresAt'> & {
  user: Pick<User, 'email' | 'role' | 'id'> & {
    profile: Profile | null;
    phraseCode: PhraseCode | null;
  };
};

export const getAuthSession = async (): Promise<AuthSessionResponse | null> => {
  const cookieStore = cookies();
  const jwtCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);

  if ( !jwtCookie || !jwtCookie.value ) {
    return null;
  }

  try {
    // Retrieve the active session along with the user data in a single query
    const sessionWithUser = await getUserByJwt(jwtCookie.value);

    // Check if a session was found
    if (!sessionWithUser) {
      Logger.withTag('AuthSession').info('Session not found or expired');
      return null; // Or handle this case as needed
    }

    return sessionWithUser as AuthSessionResponse;
  } catch (error) {
    Logger.withTag('AuthSession').error('Error fetching user and session by JWT:', error);
    return null;
  }
}


