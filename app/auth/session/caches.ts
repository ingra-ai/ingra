import { kv } from "@vercel/kv";
import { getSessionByApiKey, updateApiKeyLastUpdatedAt } from "@/data/apiKey";
import { decodeToken } from "@lib/tokens";
import { AuthSessionResponse } from "./types";
import { getActiveSessionByJwt } from "@/data/activeSession";
import { Logger } from "@lib/logger";

// KV prefixes
const ACTIVE_SESSION_REDIS_EXPIRY = 3600 * 24 * 7; // 7 days in seconds
const USERID_SESSION_KEY_PREFIX = 'userId_Session:';
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
      if ( Object.prototype.hasOwnProperty.call(obj, key) ) {
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

      if ( sessionWithUser ) {
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
 * Responsible to return sessionWithUser, and update the last updated timestamp of an API key in the database.
 * @param {string} xApiKey - The API key used to find the session.
 * @returns {AuthSessionResponse | null} Session with user or null if not found.
 */
export const getApiAuthSession = async (xApiKey: string) => {
  let sessionWithUser: AuthSessionResponse | null = null;

  if (xApiKey) {
    sessionWithUser = await kv.get<AuthSessionResponse>(APIKEY_SESSION_KEY_PREFIX + xApiKey);

    if ( sessionWithUser ) {
      // We need to fix all date type objects to be Date objects
      // Since redis stores all dates as strings
      convertDateStringsToDates(sessionWithUser);
    }

    if (!sessionWithUser) {
      sessionWithUser = await getSessionByApiKey(xApiKey);

      // Add to cache
      if (sessionWithUser) {
        await kv.set(APIKEY_SESSION_KEY_PREFIX + xApiKey, sessionWithUser, { ex: ACTIVE_SESSION_REDIS_EXPIRY });
      }
    }

    if ( sessionWithUser ) {
      await updateApiKeyLastUpdatedAt(xApiKey);
    }
  }

  return sessionWithUser;
};

/*
export const addCachesOfSession = async ( authSession: AuthSessionResponse ) => {
  return await Promise.all([
    authSession?.userId && kv.set(USERID_SESSION_KEY_PREFIX + authSession.userId, authSession, { ex: ACTIVE_SESSION_REDIS_EXPIRY }),
    ( authSession?.user?.apiKeys || [] ).map((apiKey) => {
      return kv.set(USERID_SESSION_KEY_PREFIX + apiKey.key, authSession, {
        ex: ACTIVE_SESSION_REDIS_EXPIRY
      })
    } )
  ]);
}
*/

export const clearAuthCaches = async ( authSession: AuthSessionResponse ) => {
  const allRedisKeys = [
    authSession?.userId && USERID_SESSION_KEY_PREFIX + authSession.userId,
    ...( authSession?.user?.apiKeys || [] ).map((apiKey) => {
      return USERID_SESSION_KEY_PREFIX + apiKey.key;
    } )
  ].filter( Boolean ) as string[];

  const result = await kv.del(...allRedisKeys);

  // Total auth caches deleted
  Logger.withTag('clearAuthCaches').withTag(authSession?.userId || 'N/A').info(`${ result } KV keys have been removed.`);

  return result;
}