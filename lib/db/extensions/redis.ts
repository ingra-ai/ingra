import { type ActiveSession, Prisma } from '@prisma/client';
import { kv } from '@vercel/kv';

export const UPHRASECODE_KEY_PREFIX = 'userPhraseCode:';
export const UACTIVESESSION_KEY_PREFIX = 'userActiveSession:';

export const redisExtension = Prisma.defineExtension({
  name: 'redisExtension',
  query: {
    activeSession: {
      // async findUnique({ model, operation, args, query }) {
      //   let cacheKey = '';
      //   // If there's only `code` in args.where;
      //   // return the result from Redis if exists
      //   if ( args.where && Object.keys(args.where).length === 2 && args.where.jwt && args.where.expiresAt ) {
      //     cacheKey = UACTIVESESSION_KEY_PREFIX + args.where.jwt;
      //     const cache = await kv.get<ActiveSession>( cacheKey );
      //     if ( cache ) {
      //       const argsExpiresAt = (args.where.expiresAt as Prisma.DateTimeFilter<"ActiveSession">)?.gte;
      //       if ( argsExpiresAt && argsExpiresAt >= cache.expiresAt ) {
      //         await kv.del( cacheKey );
      //         return null;
      //       }
      //       return cache;
      //     }
      //   }
      //   const result = await query(args)
      //   if ( cacheKey ) {
      //     await kv.set( cacheKey, result );
      //   }
      //   return result;
      // },
    },
  },
});
