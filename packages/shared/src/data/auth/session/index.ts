'use server';
import { cookies, headers } from 'next/headers';
import { APP_SESSION_API_KEY_NAME, APP_SESSION_COOKIE_NAME } from '@repo/shared/lib/constants';
import { Logger } from '@repo/shared/lib/logger';
import { AuthSessionResponse, GetAuthSessionOptions } from './types';
import { clearAuthCaches, getApiAuthSession, getOAuthAuthSession, getWebAuthSession } from './caches';
import { introspectOAuthToken } from './introspect';

/**
 * Retrieves the authentication session for the current user.
 * @returns A Promise that resolves to an AuthSessionResponse object if a session is found, or null if not found or expired.
 */
export const getAuthSession = async (opts?: GetAuthSessionOptions): Promise<AuthSessionResponse | null> => {
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

    // Create an array of promises to introspect all default OAuth tokens
    const introspectedTokensPromises: ReturnType<typeof introspectOAuthToken>[] = [];

    // If we have a session with a user, and we need to introspect OAuth tokens, do so.
    if (sessionWithUser?.user && introspectOAuthTokens) {
      const { user } = sessionWithUser;

      if (user.id && user.email && user.oauthTokens.length) {
        // Get all default OAuth tokens
        const allDefaultOAuthTokens = user.oauthTokens.filter((oauth) => oauth.isDefault);

        // Loop through all default OAuth tokens
        for (const defaultOAuthToken of allDefaultOAuthTokens) {
          introspectedTokensPromises.push(introspectOAuthToken(defaultOAuthToken));
        }
      }
    }

    shouldClearCache = await Promise.all(introspectedTokensPromises).then((introspectedTokens) => {

      const truthyIntrospectedTokens = introspectedTokens.filter((token) => token);

      for ( const introspectedToken of truthyIntrospectedTokens ) {
        if (introspectedToken) {
          // Replace the old token with the new one in the session
          sessionWithUser?.user?.oauthTokens.forEach((oauthToken, index) => {
            if (oauthToken.id === introspectedToken.id) {
              sessionWithUser.user.oauthTokens[index] = introspectedToken;
            }
          });
        }
      }

      return truthyIntrospectedTokens.length > 0;
    });

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
