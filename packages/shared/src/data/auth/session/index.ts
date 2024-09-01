'use server';
import { cookies, headers } from 'next/headers';
import { APP_SESSION_API_KEY_NAME, APP_SESSION_COOKIE_NAME } from '../../../lib/constants';
import { Logger } from '../../../lib/logger';
import { AuthSessionResponse } from './types';
import { clearAuthCaches, getApiAuthSession, getWebAuthSession } from './caches';
import { refreshGoogleOAuthCredentials } from '../../../lib/google-oauth/refreshGoogleOAuthCredentials';
import { deleteOAuthToken, updateOAuthToken } from '../../oauthToken';

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

    if (jwt) {
      sessionWithUser = await getWebAuthSession(jwt);
    } else if (xApiKey) {
      sessionWithUser = await getApiAuthSession(xApiKey);
    }

    if (sessionWithUser?.user) {
      const { user } = sessionWithUser;

      // Attempt to renew OAuth tokens if they exist
      // And, only if oauth tokens exist and its almost expired.
      // And, also update to database if there are any changes.
      // Otherwise, newOAuthCredentials will all be falseys.
      if (user.id && user.email && user.oauthTokens.length) {
        // Grab defaults oauth token to refresh
        const defaultOAuthTokenIndex = user.oauthTokens.findIndex((oauth) => oauth.isDefault),
          defaultOAuthToken = user.oauthTokens[defaultOAuthTokenIndex];

        if (!defaultOAuthToken) {
          Logger.withTag('action|getAuthSession').withTag(`user|${user.id}`).error('User has no default OAuth token.');
          return sessionWithUser;
        }

        /**
         * 1. Refresh google OAuth credentials if necessary.
         */
        const newOAuthCredentials = await refreshGoogleOAuthCredentials(defaultOAuthToken)
          .then(async (newOAuth) => {
            if (newOAuth?.credentials) {
              /**
               * 2. After refreshing credentials, always update the OAuth token in the database.
               */
              const updatedOAuthRecord = updateOAuthToken(newOAuth.userId, newOAuth.primaryEmailAddress, newOAuth.credentials).then((updatedOAuth) => {
                if (updatedOAuth) {
                  Logger.withTag('action|getAuthSession').withTag(`user|${user.id}`).info('Refreshed OAuth tokens:', {
                    oauthId: updatedOAuth?.id,
                    expiryDate: updatedOAuth.expiryDate,
                  });
                }

                return updatedOAuth;
              });

              await updatedOAuthRecord.then((updatedOAuth) => {
                /**
                 * 3. Update the user's oauth references with the new OAuth record.
                 */
                if (updatedOAuth) {
                  user.oauthTokens[defaultOAuthTokenIndex] = updatedOAuth;
                }
              });

              return newOAuth.credentials;
            } else {
              // No updates required for this oauth token.
            }

            return null;
          })
          .catch(async (err) => {
            /**
             * 2.5 Or if it has an error, which means refreshing would've failed.
             * @todo I would say we tell the user that their OAuth token is expired and they need to re-authenticate.
             * @todo We can also send an email to the user to let them know that their OAuth token is expired.
             * @todo And we should probably flag it in database, and also in the UI. So user can re-authenticate.
             */
            Logger.withTag('action|getAuthSession').withTag(`user|${user.id}`).error('Error refreshing OAuth credentials:', err);
            Logger.withTag('action|getAuthSession').withTag(`user|${user.id}`).error('Deleting oauth token due to refresh token may be corrupted.', { id: defaultOAuthToken?.id });
            await deleteOAuthToken(defaultOAuthToken?.id, user.id);
          });

        /**
         * 4. One or more oauth tokens for this user was refreshed.
         */
        shouldClearCache = !!newOAuthCredentials;
      }
    }

    // Trigger caches
    if (shouldClearCache && sessionWithUser) {
      await clearAuthCaches(sessionWithUser);
    }

    return sessionWithUser;
  } catch (error) {
    Logger.withTag('action|getAuthSession').error('Error fetching user and session by either JWT or API key:', error);
    return null;
  }
};
