import { kv } from '@vercel/kv';
import { getApiKeysByUserId, getSessionByApiKey, updateApiKeyLastUpdatedAt } from '@repo/shared/data/apiKey';
import { decodeToken } from '@repo/shared/lib/tokens';
import { AuthSessionResponse } from './types';
import { getActiveSessionByJwt } from '@repo/shared/data/activeSession';
import { Logger } from '@repo/shared/lib/logger';
import { getActiveSessionByAccessToken } from '@repo/shared/data/oauthToken';

// KV prefixes
const ACTIVE_SESSION_REDIS_EXPIRY = 3600 * 24 * 7; // 7 days in seconds
const USERID_SESSION_KEY_PREFIX = 'userId_Session:';
const OAUTH_SESSION_KEY_PREFIX = 'oAuth_Session:';
const APIKEY_SESSION_KEY_PREFIX = 'apiKey_Session:';

/**
 * Recursively traverses an object and converts date-like strings to Date objects.
 *
 * @param obj - The object to be traversed.
 * @returns The object with date-like strings converted to Date objects.
 */
function convertDateStringsToDates(obj: any): any {
  // Regular expression to match date strings in ISO 8601 format
  const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string' && isoDateRegex.test(obj)) {
    return new Date(obj);
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = convertDateStringsToDates(obj[key]);
      }
    }
  }

  return obj;
}

/**
 * Retrieves the web authentication session for the given JWT.
 * @param { string } jwt The JSON Web Token.
 * @returns The authentication session with the user, or null if not found.
 */
export const getWebAuthSession = async (jwt: string) => {
  let sessionWithUser: AuthSessionResponse | null = null;

  if (jwt) {
    const decodedJwt = decodeToken<{ id: string }>(jwt);

    if (typeof decodedJwt?.id === 'string' && decodedJwt.id.length > 0) {
      const userId = decodedJwt.id;
      sessionWithUser = await kv.get<AuthSessionResponse>(USERID_SESSION_KEY_PREFIX + userId);

      if (sessionWithUser) {
        // We need to fix all date type objects to be Date objects
        // Since redis stores all dates as strings
        convertDateStringsToDates(sessionWithUser);
      }
    }

    if (!sessionWithUser) {
      sessionWithUser = await getActiveSessionByJwt(jwt);

      // Add to cache
      if (sessionWithUser) {
        await kv.set(USERID_SESSION_KEY_PREFIX + sessionWithUser.userId, sessionWithUser, { ex: ACTIVE_SESSION_REDIS_EXPIRY });
      }
    }
  }

  return sessionWithUser;
};

/**
 * Retrieves an OAuth authentication session using the provided access token.
 * 
 * This function first attempts to decode the access token to extract the user ID.
 * If a valid user ID is found, it tries to retrieve the session from the cache.
 * If the session is found in the cache, it converts any date strings to Date objects.
 * If the session is not found in the cache, it retrieves the active session by the access token
 * and stores it in the cache with an expiration time.
 * 
 * @param {string} accessToken - The access token used to retrieve the session.
 * @returns {Promise<AuthSessionResponse | null>} - A promise that resolves to the authentication session or null if not found.
 */
export const getOAuthAuthSession = async (accessToken: string) => {
  let sessionWithUser: AuthSessionResponse | null = null;

  if (accessToken) {
    const decodedJwt = decodeToken<{ id: string }>(accessToken);

    if (typeof decodedJwt?.id === 'string' && decodedJwt.id.length > 0) {
      const userId = decodedJwt.id;
      sessionWithUser = await kv.get<AuthSessionResponse>(OAUTH_SESSION_KEY_PREFIX + userId);

      if (sessionWithUser) {
        // We need to fix all date type objects to be Date objects
        // Since redis stores all dates as strings
        convertDateStringsToDates(sessionWithUser);
      }
    }

    if (!sessionWithUser) {
      sessionWithUser = await getActiveSessionByAccessToken(accessToken);

      // Add to cache
      if (sessionWithUser) {
        await kv.set(OAUTH_SESSION_KEY_PREFIX + sessionWithUser.userId, sessionWithUser, { ex: ACTIVE_SESSION_REDIS_EXPIRY });
      }
    }
  }

  return sessionWithUser;
}

/**
 * Responsible to return sessionWithUser, and update the last updated timestamp of an API key in the database.
 * @param {string} xApiKey - The API key used to find the session.
 * @returns {AuthSessionResponse | null} Session with user or null if not found.
 */
export const getApiAuthSession = async (xApiKey: string) => {
  let sessionWithUser: AuthSessionResponse | null = null;

  if (xApiKey) {
    sessionWithUser = await kv.get<AuthSessionResponse>(APIKEY_SESSION_KEY_PREFIX + xApiKey);

    if (sessionWithUser) {
      // We need to fix all date type objects to be Date objects
      // Since redis stores all dates as strings
      convertDateStringsToDates(sessionWithUser);
    }

    if (!sessionWithUser) {
      sessionWithUser = await getSessionByApiKey(xApiKey);

      // Add to cache
      if (sessionWithUser) {
        await kv.set(APIKEY_SESSION_KEY_PREFIX + xApiKey, sessionWithUser, {
          ex: ACTIVE_SESSION_REDIS_EXPIRY,
        });
      }
    }

    if (sessionWithUser) {
      await updateApiKeyLastUpdatedAt(xApiKey);
    }
  }

  return sessionWithUser;
};

export const clearAuthCaches = async (authSession: Pick<AuthSessionResponse, 'userId'>) => {

  if (authSession?.userId) {
    const userApiKeys = await getApiKeysByUserId(authSession.userId, {
      key: true,
    });

    const allRedisKeys = [
      USERID_SESSION_KEY_PREFIX + authSession.userId,
      OAUTH_SESSION_KEY_PREFIX + authSession.userId,
      ...(userApiKeys).map((apiKey) => {
        return APIKEY_SESSION_KEY_PREFIX + apiKey.key;
      }),
    ].filter(Boolean) as string[];

    const result = await kv.del(...allRedisKeys);

    // Total auth caches deleted
    Logger.withTag('action|clearAuthCaches').withTag(`user|${authSession.userId}`).info(`${result} KV keys have been removed.`, { allRedisKeys });
  }

  return 0;
};
