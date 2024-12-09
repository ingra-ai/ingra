'use server';
import { cookies, headers } from 'next/headers';
import { APP_SESSION_API_KEY_NAME, APP_SESSION_COOKIE_NAME } from '@repo/shared/lib/constants';
import { Logger } from '@repo/shared/lib/logger';
import { AuthSessionResponse, GetAuthSessionOptions } from './types';
import { clearAuthCaches, getApiAuthSession, getOAuthAuthSession, getWebAuthSession } from './caches';
import { refreshGoogleOAuthCredentials } from '@repo/shared/lib/google-oauth/refreshGoogleOAuthCredentials';
import { revokeOAuth, updateOAuthToken } from '@repo/shared/actions/oauth';

/**
 * Retrieves the authentication session for the current user.
 * @returns A Promise that resolves to an AuthSessionResponse object if a session is found, or null if not found or expired.
 */
export const getAuthSession = async ( opts?: GetAuthSessionOptions ): Promise<AuthSessionResponse | null> => {
  const { introspectOAuthTokens = false } = opts || {};

  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);
  const jwt = cookieStore.get(APP_SESSION_COOKIE_NAME)?.value;
  const xApiKey = headersList.get(APP_SESSION_API_KEY_NAME);
  const authHeader = headersList.get('Authorization');

  try {
    let sessionWithUser: AuthSessionResponse | null = null;
    let shouldClearCache = false;

    if (jwt) {
      sessionWithUser = await getWebAuthSession(jwt);
    } else if (xApiKey) {
      sessionWithUser = await getApiAuthSession(xApiKey);
    } else if (authHeader) {
      const [tokenType, token] = authHeader.split(' ');

      if (tokenType?.toLocaleLowerCase() === 'bearer' && token) {
        sessionWithUser = await getOAuthAuthSession(token);
      }
    }

    // If we have a session with a user, and we need to introspect OAuth tokens, do so.
    if (sessionWithUser?.user && introspectOAuthTokens ) {
      const { user } = sessionWithUser;

      // Attempt to renew OAuth tokens if they exist
      // And, only if oauth tokens exist and its almost expired.
      // And, also update to database if there are any changes.
      // Otherwise, newOAuthCredentials will all be falseys.
      if (user.id && user.email && user.oauthTokens.length) {
        user.oauthTokens.filter((oauth) => oauth.isDefault).forEach(async (defaultOAuthToken) => {

        /**
         * 1. Refresh google OAuth credentials if necessary (only works if it's a google-oauth token).
         */
        const newOAuthCredentials = await refreshGoogleOAuthCredentials(defaultOAuthToken)
          .then(async (newOAuth) => {
            if (newOAuth?.credentials) {
              /**
               * 2. After refreshing credentials, always update the OAuth token in the database.
               */
              const updatedOAuthRecord = updateOAuthToken({
                id: defaultOAuthToken.id,
                primaryEmailAddress: newOAuth.primaryEmailAddress,
                accessToken: newOAuth.credentials?.access_token || '',
                refreshToken: newOAuth.credentials?.refresh_token || '',
                idToken: newOAuth.credentials?.id_token || '',
                tokenType: newOAuth.credentials?.token_type || '',
                expiryDate: new Date(newOAuth.credentials?.expiry_date || 0),
                scope: defaultOAuthToken.scope,
                service: defaultOAuthToken.service as 'google-oauth',
              }).then(({ data: updatedOAuth }) => {
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
                  const oauthTokenIdx = user.oauthTokens.findIndex((oauth) => oauth.id === updatedOAuth.id);

                  if ( oauthTokenIdx >= 0 ) {
                    user.oauthTokens[oauthTokenIdx] = updatedOAuth;
                  }
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
            Logger.withTag('action|getAuthSession').withTag(`user|${user.id}`).error('Error refreshing OAuth credentials:', err?.message);
            Logger.withTag('action|getAuthSession').withTag(`user|${user.id}`).error('Deleting oauth token due to refresh token may be corrupted.', { id: defaultOAuthToken?.id });
            await revokeOAuth(defaultOAuthToken);
          });

          /**
           * 4. One or more oauth tokens for this user was refreshed.
           */
          if ( !shouldClearCache ) {
            shouldClearCache = !!newOAuthCredentials;
          }
        });
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
