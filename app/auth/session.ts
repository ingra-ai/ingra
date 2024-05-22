'use server';
import { cookies, headers } from 'next/headers';
import { type User, type Profile, type OAuthToken, type EnvVars } from '@prisma/client';
import { APP_GOOGLE_OAUTH_CALLBACK_URL, APP_GOOGLE_OAUTH_CLIENT_ID, APP_GOOGLE_OAUTH_CLIENT_SECRET, APP_SESSION_API_KEY_NAME, APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { Logger } from '@lib/logger';
import { getUserByApiKey, getUserByJwt } from '@/data/user';
import db from '@lib/db';
import { deleteAllUserCaches } from '@lib/db/extensions/redis';
import { google } from 'googleapis';

export type AuthSessionResponse = {
  expiresAt?: Date;
} & {
  user: Pick<User, 'email' | 'role' | 'id'> & {
    profile: Profile | null;
    oauthTokens: OAuthToken[];
    envVars: EnvVars[];
  };
};

/**
 * Retrieves the authentication session for the current user.
 * @returns A Promise that resolves to an AuthSessionResponse object if a session is found, or null if not found or expired.
 */
export const getAuthSession = async (): Promise<AuthSessionResponse | null> => {
  const cookieStore = cookies();
  const headersList = headers();
  const jwtCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);
  const xApiKey = headersList.get(APP_SESSION_API_KEY_NAME);

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

    if ( sessionWithUser && (sessionWithUser.user?.oauthTokens || [])?.length > 0 ) {
      const oauthRefreshes = await Promise.all( sessionWithUser.user.oauthTokens.map( refreshOauthToken ) );

      for ( let i = 0, len = oauthRefreshes.length; i < len; i++ ) {
        const [currentOAuth, newOAuth] = [
          sessionWithUser.user.oauthTokens?.[i],
          oauthRefreshes?.[i]
        ];

        if ( currentOAuth && newOAuth && ( currentOAuth.accessToken !== newOAuth.accessToken ) ) {
          // Update the existing OAuth
          currentOAuth.accessToken = newOAuth.accessToken;

          // Update lastRefreshedAt
          currentOAuth.lastRefreshedAt = newOAuth.lastRefreshedAt;
        }
      }
    }

    return sessionWithUser;
  } catch (error) {
    Logger.withTag('AuthSession').error('Error fetching user and session by either JWT or API key:', error);
    return null;
  }
};

export const refreshOauthToken = async (oauthToken: OAuthToken) => {
  const currentDateWithOffset = new Date(Date.now() - 20e3); // now - 20seconds

  /**
   * e.g. So, currentDate is more than expiryDate
    currentDate: 2024-05-22T04:33:24.296Z,
    expiryDate: 2024-05-21T05:07:31.768Z

   */
  if ( oauthToken.expiryDate && currentDateWithOffset > oauthToken.expiryDate ) {
    Logger.withTag('refreshOauthToken').info('Refresh is necessary for token:', {
      oauthTokenId: oauthToken.id,
      currentDateWithOffset,
      expiryDate: oauthToken.expiryDate
    });

    const recordId = oauthToken.id;
    const oauth2Client = new google.auth.OAuth2(
      APP_GOOGLE_OAUTH_CLIENT_ID,
      APP_GOOGLE_OAUTH_CLIENT_SECRET,
      APP_GOOGLE_OAUTH_CALLBACK_URL // e.g., http://localhost:3000/api/auth/google-oauth/callback
    );
  
    oauth2Client.setCredentials({
      access_token: oauthToken.accessToken,
      refresh_token: oauthToken.refreshToken,
    });
  
    const [{ credentials }] = await Promise.all([
      oauth2Client.refreshAccessToken().catch((err) => {
        Logger.withTag('refreshOauthToken').error('Error refreshing token', { err } );
        return {
          credentials: {
            access_token: null,
            expiry_date: null,
          },
        };
      }),
  
      // Delete kv caches for this user
      deleteAllUserCaches(oauthToken.userId)
    ]);
  
    if (credentials.access_token) {
      const newExpiryDate = new Date(credentials.expiry_date || Date.now()),
        lastRefreshedAt = new Date();
  
      const updatedOAuth = await db.oAuthToken.update({
        where: {
          id: recordId,
        },
        data: {
          accessToken: credentials.access_token,
          expiryDate: newExpiryDate,
          lastRefreshedAt,
        },
      });
  
      return updatedOAuth;
    }
  }

  return false;
}
