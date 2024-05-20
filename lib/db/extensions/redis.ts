import { Logger } from '@lib/logger';
import { type ActiveSession, Prisma, ApiKey } from '@prisma/client';
import { kv } from '@vercel/kv';

const AUTH_SESSION_REDIS_EXPIRY = 3600 * 24 * 7; // 7 days in seconds

export const ACTIVE_SESSION_KEY_PREFIX = 'activeSession:';
export const API_KEY_SESSION_KEY_PREFIX = 'apiKeySession:';
export const USER_CACHES_LIST_PREFIX = 'userCachesList:';

export const deleteAllUserCaches = async (userId: string) => {
  if ( !userId ) {
    return false;
  }

  const userCacheListKey = USER_CACHES_LIST_PREFIX + userId;

  // Get the list of cache keys for this user
  const userCacheList = await kv.get<string[]>( userCacheListKey );

  // Delete everything in this list
  const deletePromises = [];
  if ( userCacheList ) {
    for ( const cacheKey of userCacheList ) {
      deletePromises.push(kv.del( cacheKey ));
    }
  }

  // Delete this key
  await Promise.all(deletePromises).finally(() => {
    kv.del( userCacheListKey );
  });

  return true;
};

export const redisExtension = Prisma.defineExtension({
  name: 'redisExtension',

  query: {
    activeSession: {
      async findUnique({ model, operation, args, query }) {
        let cacheKey = '';
        // If there's only `code` in args.where;
        // return the result from Redis if exists
        if ( args.where && Object.keys(args.where).length === 2 && args.where.jwt && args.where.expiresAt ) {
          cacheKey = ACTIVE_SESSION_KEY_PREFIX + args.where.jwt;

          const cachedRecord = await kv.get<ActiveSession>( cacheKey );

          if ( cachedRecord ) {
            Logger.withTag('kv').withTag('redisExtension').info('Cache hit for activeSession', { activeSessionId: cachedRecord.id });

            // Extend the token expiry time in Redis and update the expiresAt field
            const newExpiryDate = new Date();
            newExpiryDate.setSeconds(newExpiryDate.getSeconds() + AUTH_SESSION_REDIS_EXPIRY);

            cachedRecord.expiresAt = newExpiryDate;
      
            // Extend the token expiry time in Redis
            kv.expire(cacheKey, AUTH_SESSION_REDIS_EXPIRY);
            return cachedRecord;
          }
        }

        const result = await query(args);

        if ( cacheKey ) {
          Logger.withTag('kv').withTag('redisExtension').info('Cache miss for activeSession. Setting it now;', { activeSessionId: result?.id });

          kv.set( cacheKey, JSON.stringify(result), {
            ex: AUTH_SESSION_REDIS_EXPIRY,
          } );

          // The step where we can clear the cache for the user when there's an update that affects apiKey cache.
          if ( result?.userId ) {
            // Store cache key for easier deletion later on;
            const userCacheListKey = USER_CACHES_LIST_PREFIX + result.userId;

            // Insert cacheKey to the list of cache keys for this user
            const userCacheList = await kv.get<string[]>( userCacheListKey );
            if ( !userCacheList ) {
              kv.set( userCacheListKey, [cacheKey] );
            } else {
              kv.set( userCacheListKey, [...userCacheList, cacheKey] );
            }
          }
        }

        return result;
      },
    },
    apiKey: {
      async findUnique({ model, operation, args, query }) {
        let cacheKey = '';
        // If there's only `code` in args.where;
        // return the result from Redis if exists
        if ( args.where && Object.keys(args.where).length === 1 && args.where.key ) {
          cacheKey = API_KEY_SESSION_KEY_PREFIX + args.where.key;

          const cachedRecord = await kv.get<ApiKey>( cacheKey );

          if ( cachedRecord ) {
            Logger.withTag('kv').withTag('redisExtension').info('Cache hit for apiKey', { apiKeyId: cachedRecord.id });
      
            // Extend the token expiry time in Redis
            kv.expire(cacheKey, AUTH_SESSION_REDIS_EXPIRY);
            return cachedRecord;
          }
        }

        const result = await query(args);

        if ( cacheKey ) {
          Logger.withTag('kv').withTag('redisExtension').info('Cache miss for apiKey. Setting it now;', { apiKeyId: result?.id });

          kv.set( cacheKey, JSON.stringify(result), {
            ex: AUTH_SESSION_REDIS_EXPIRY,
          } );

          // The step where we can clear the cache for the user when there's an update that affects apiKey cache.
          if ( result?.userId ) {
            // Store cache key for easier deletion later on;
            const userCacheListKey = USER_CACHES_LIST_PREFIX + result.userId;

            // Insert cacheKey to the list of cache keys for this user
            const userCacheList = await kv.get<string[]>( userCacheListKey );
            if ( !userCacheList ) {
              kv.set( userCacheListKey, [cacheKey] );
            } else {
              kv.set( userCacheListKey, [...userCacheList, cacheKey] );
            }
          }

        }

        return result;
      },
    }
  },
});

