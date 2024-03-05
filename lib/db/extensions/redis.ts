import { type ActiveSession, type PhraseCode, Prisma } from '@prisma/client'
import { kv } from '@vercel/kv';

export const UPHRASECODE_KEY_PREFIX = 'userPhraseCode:';
export const UACTIVESESSION_KEY_PREFIX = 'userActiveSession:';

export const redisExtension = Prisma.defineExtension({
  name: 'redisExtension',
  query: {
    phraseCode: {
      async findUnique({ model, operation, args, query }) {
        let cacheKey = '';
    
        // If there's only `code` in args.where;
        // return the result from Redis if exists
        if ( args.where && Object.keys(args.where).length === 1 && args.where.code ) {
          cacheKey = UPHRASECODE_KEY_PREFIX + args.where.code;
          const cache = await kv.get<PhraseCode>( cacheKey );
          if ( cache ) {
            return cache;
          }
        }

        const result = await query(args)

        if ( cacheKey ) {
          await kv.set( cacheKey, result );
        }

        return result;
      },
    },
    /* Has login issue with this code at getAuthSession
    activeSession: {
      async findUnique({ model, operation, args, query }) {
        let cacheKey = '';
    
        // If there's only `code` in args.where;
        // return the result from Redis if exists
        if ( args.where && Object.keys(args.where).length === 2 && args.where.jwt && args.where.expiresAt ) {
          cacheKey = UACTIVESESSION_KEY_PREFIX + args.where.jwt;
          const cache = await kv.get<ActiveSession>( cacheKey );
          console.log({ cacheKey, cache })
          if ( cache ) {
            if ( cache.expiresAt <= args.where.expiresAt ) {
              // If the cache is expired, return null and delete the cache
              await kv.del( cacheKey );
              return null;
            }
            else {
              return cache;
            }
          }
        }

        const result = await query(args)

        if ( cacheKey ) {
          await kv.set( cacheKey, result );
        }

        return result;
      },
    }
    */
  },
});
