import { Prisma } from '@prisma/client';

export const redisExtension = Prisma.defineExtension({
  name: 'redisExtension',
  query: {
  },
});

