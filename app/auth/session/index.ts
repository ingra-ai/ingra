'use server';
import { cookies, headers } from 'next/headers';
import { APP_SESSION_API_KEY_NAME, APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { Logger } from '@lib/logger';
import { AuthSessionResponse } from '@app/auth/session/types';
import { clearAuthCaches, getApiAuthSession, getWebAuthSession } from './caches';
import { refreshGoogleOAuthCredentials } from '@lib/google-oauth/refreshGoogleOAuthCredentials';
import { updateOAuthToken } from '@/data/oauthToken';

/**
 * Retrieves the authentication session for the current user.
 * @returns A Promise that resolves to an AuthSessionResponse object if a session is found, or null if not found or expired.
 */
export const getAuthSession = async (): Promise<AuthSessionResponse | null> => {
  const cookieStore = cookies();
  const headersList = headers();
  const jwt = cookieStore.get(APP_SESSION_COOKIE_NAME)?.value;
  const xApiKey = headersList.get(APP_SESSION_API_KEY_NAME);

  try {
    let sessionWithUser: AuthSessionResponse | null = null;
    let shouldClearCache = false;

    if ( jwt ) {
      sessionWithUser = await getWebAuthSession(jwt);
    }
    else if ( xApiKey ) {
      sessionWithUser = await getApiAuthSession(xApiKey);
    }

    if ( sessionWithUser?.user ) {
      const { user } = sessionWithUser;

      // Attempt to renew OAuth tokens if they exist
      // And, only if oauth tokens exist and its almost expired.
      // And, also update to database if there are any changes.
      // Otherwise, newOAuthCredentials will all be falseys.
      if ( user.id && user.email && user.oauthTokens.length ) {
        /**
         * 1. Refresh google OAuth credentials if necessary.
         */
        const newOAuthCredentials = await Promise.all(user.oauthTokens.map(refreshGoogleOAuthCredentials)).then(async (oauthRefreshes) => {
          const updateOAuthPromises: ReturnType<typeof updateOAuthToken>[] = [];

          for (let i = 0, len = oauthRefreshes?.length; i < len; i++) {
            const newOAuth = oauthRefreshes?.[i];

            if ( newOAuth?.credentials ) {
              /**
               * 2. After refreshing credentials, always update the OAuth token in the database.
               */
              const updatedOAuthRecord = updateOAuthToken(newOAuth.userId, newOAuth.primaryEmailAddress, newOAuth.credentials).then( (updatedOAuth) => {
                if ( updatedOAuth ) {
                  Logger.withTag('getAuthSession').withTag( user.id ).info('Refreshed OAuth tokens:', { 
                    oauthId: updatedOAuth?.id,
                    expiryDate: updatedOAuth.expiryDate,
                  });
                }

                return updatedOAuth;
              });

              // Push to upsertPromises array
              updateOAuthPromises.push(updatedOAuthRecord);
            }
          }

          await Promise.all(updateOAuthPromises).then( (updateOAuthRes) => {
            for (let i = 0, len = updateOAuthRes?.length; i < len; i++) {
              /**
               * 3. Update the user's oauth references with the new OAuth record.
               */
              const updatedOAuthRecord = updateOAuthRes?.[i];
              if ( updatedOAuthRecord ) {
                user.oauthTokens[i] = updatedOAuthRecord;
              }
            }
          });

          return oauthRefreshes.map( (newOAuth) => newOAuth?.credentials );
        });

        /**
         * 4. One or more oauth tokens for this user was refreshed.
         */
        shouldClearCache = newOAuthCredentials.filter( Boolean ).length > 0;
      }
    }
    
    // Trigger caches
    if ( shouldClearCache && sessionWithUser ) {
      await clearAuthCaches(sessionWithUser);
    }

    return sessionWithUser;
  } catch (error) {
    Logger.withTag('getAuthSession').error('Error fetching user and session by either JWT or API key:', error);
    return null;
  }
};

